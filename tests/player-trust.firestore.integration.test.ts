import assert from 'node:assert/strict'
import test from 'node:test'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore'
import {
  createPlayerReview,
  getPlayerTrustSummary,
} from '../src/player-trust/application/playerTrust.ts'
import type { ReviewSessionEvidence } from '../src/player-trust/domain/reviewEligibility.ts'
import { createFirestorePlayerReviewRepository } from '../src/player-trust/infrastructure/firestorePlayerReviewRepository.ts'
import { createSha256ReviewId } from '../src/player-trust/infrastructure/reviewId.ts'

const projectId = process.env.MESA_ABIERTA_PLAYER_TRUST_PROJECT_ID
  ?? 'demo-mesa-abierta-player-trust-tests'
const port = Number(process.env.MESA_ABIERTA_PLAYER_TRUST_PORT ?? '8180')

const pastSession: ReviewSessionEvidence = {
  sessionId: 'past-review-session',
  gameName: 'Azul',
  startsAt: '2026-01-20T17:30:00.000Z',
  status: 'scheduled',
  participantIds: ['olivia', 'pablo'],
}
const futureSession: ReviewSessionEvidence = {
  ...pastSession,
  sessionId: 'future-review-session',
  startsAt: '2027-01-20T17:30:00.000Z',
}
const cancelledSession: ReviewSessionEvidence = {
  ...pastSession,
  sessionId: 'cancelled-review-session',
  status: 'cancelled',
}
const evidenceById = new Map(
  [pastSession, futureSession, cancelledSession].map((session) => [session.sessionId, session]),
)

const dependenciesFor = (
  repository: ReturnType<typeof createFirestorePlayerReviewRepository>,
) => ({
  repository,
  dependencies: {
    reviewRepository: repository,
    eligibilityReader: {
      getSessionEvidence: async (sessionId: string) => evidenceById.get(sessionId) ?? null,
    },
    createReviewId: createSha256ReviewId,
    now: () => new Date('2026-09-24T10:00:00.000Z'),
  },
})

test('Olivia publishes a persistent review that Pablo can read, without duplicates', async () => {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port },
  })

  try {
    await environment.clearFirestore()
    await environment.withSecurityRulesDisabled(async (context) => {
      const database = context.firestore()
      await Promise.all([
        setDoc(doc(database, 'betaTesters', 'olivia'), { active: true }),
        setDoc(doc(database, 'betaTesters', 'pablo'), { active: true }),
        setDoc(doc(database, 'players', 'olivia'), {
          displayName: 'Olivia Organizadora', city: 'Madrid', district: 'Chamberí',
        }),
        setDoc(doc(database, 'players', 'pablo'), {
          displayName: 'Pablo Participante', city: 'Madrid', district: 'Retiro',
        }),
        ...[pastSession, futureSession, cancelledSession].map((session) =>
          setDoc(doc(database, 'gameSessions', session.sessionId), {
            gameName: session.gameName,
            startsAt: Timestamp.fromDate(new Date(session.startsAt)),
            date: session.startsAt.startsWith('2027') ? '2027-01-20' : '2026-01-20',
            time: '18:30',
            city: 'Madrid',
            district: 'Chamberí',
            capacity: 4,
            organizerId: 'olivia',
            participantIds: [...session.participantIds],
            pendingRequestIds: [],
            status: session.status,
          }),
        ),
      ])
    })

    const oliviaFirestore = environment.authenticatedContext('olivia').firestore()
    const pabloFirestore = environment.authenticatedContext('pablo').firestore()
    const olivia = dependenciesFor(createFirestorePlayerReviewRepository(oliviaFirestore))

    const input = {
      sessionId: pastSession.sessionId,
      reviewerId: 'olivia',
      reviewedPlayerId: 'pablo',
      rating: 5,
      comment: 'Buen ambiente y explicó el juego perfectamente.',
    }
    const created = await createPlayerReview(olivia.dependencies, input)
    assert.equal(created.kind, 'created')

    const expectedId = await createSha256ReviewId(input)
    assert.equal(created.kind === 'created' && created.review.id, expectedId)
    const persisted = await getDoc(doc(pabloFirestore, 'playerReviews', expectedId))
    assert.equal(persisted.exists(), true)
    assert.equal(persisted.data()?.reviewedPlayerId, 'pablo')
    assert.equal(persisted.data()?.createdAt instanceof Timestamp, true)

    const duplicate = await createPlayerReview(olivia.dependencies, input)
    assert.deepEqual(duplicate, { kind: 'duplicate' })

    const reloadedPabloRepository = createFirestorePlayerReviewRepository(
      environment.authenticatedContext('pablo').firestore(),
    )
    const persistedSummary = await getPlayerTrustSummary(reloadedPabloRepository, 'pablo')
    assert.equal(persistedSummary.reviewCount, 1)
    assert.equal(persistedSummary.averageRating, 5)
    assert.equal(persistedSummary.recentReviews[0]?.comment, input.comment)

    const future = await createPlayerReview(olivia.dependencies, {
      ...input,
      sessionId: futureSession.sessionId,
    })
    assert.equal(future.kind, 'ineligible')
    assert.equal(future.kind === 'ineligible' && future.eligibility.kind === 'ineligible'
      ? future.eligibility.reason
      : null, 'session-not-past')

    const cancelled = await createPlayerReview(olivia.dependencies, {
      ...input,
      sessionId: cancelledSession.sessionId,
    })
    assert.equal(cancelled.kind, 'ineligible')
    assert.equal(cancelled.kind === 'ineligible' && cancelled.eligibility.kind === 'ineligible'
      ? cancelled.eligibility.reason
      : null, 'session-cancelled')

    const futureId = await createSha256ReviewId({ ...input, sessionId: futureSession.sessionId })
    await assert.rejects(() => olivia.repository.create({
      ...input,
      id: futureId,
      sessionId: futureSession.sessionId,
    }))
    const cancelledId = await createSha256ReviewId({ ...input, sessionId: cancelledSession.sessionId })
    await assert.rejects(() => olivia.repository.create({
      ...input,
      id: cancelledId,
      sessionId: cancelledSession.sessionId,
    }))

    await environment.withSecurityRulesDisabled(async (context) => {
      const database = context.firestore()
      await Promise.all(Array.from({ length: 11 }, async (_, index) => {
        const reviewerId = `reviewer-${index}`
        const reviewId = await createSha256ReviewId({
          sessionId: `historical-session-${index}`,
          reviewerId,
          reviewedPlayerId: 'pablo',
        })
        return setDoc(doc(database, 'playerReviews', reviewId), {
          id: reviewId,
          sessionId: `historical-session-${index}`,
          reviewerId,
          reviewedPlayerId: 'pablo',
          rating: index % 2 === 0 ? 4 : 3,
          createdAt: Timestamp.fromDate(new Date(`2026-02-${String(index + 1).padStart(2, '0')}T10:00:00.000Z`)),
        })
      }))
    })

    const pageOne = await reloadedPabloRepository.getReceivedPage('pablo', 10)
    assert.equal(pageOne.reviews.length, 10)
    assert.ok(pageOne.nextCursor)
    const pageTwo = await reloadedPabloRepository.getReceivedPage('pablo', 10, pageOne.nextCursor)
    assert.equal(pageTwo.reviews.length, 2)
    assert.equal(pageTwo.nextCursor, undefined)

    const fullSummary = await getPlayerTrustSummary(reloadedPabloRepository, 'pablo')
    assert.equal(fullSummary.reviewCount, 12)
    assert.equal(fullSummary.recentReviews.length, 3)
    assert.equal(fullSummary.averageRating, 44 / 12)
  } finally {
    await environment.cleanup()
  }
})
