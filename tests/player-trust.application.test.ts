import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPlayerReview,
  getPlayerTrustSummary,
  getReviewEligibility,
  getReviewablePlayersForSession,
} from '../src/player-trust/application/playerTrust.ts'
import { createInMemoryPlayerReviewRepository } from '../src/player-trust/infrastructure/inMemoryPlayerTrust.ts'
import { createSha256ReviewId } from '../src/player-trust/infrastructure/reviewId.ts'

const pastEvidence = {
  sessionId: 'past-session',
  gameName: 'Azul',
  startsAt: '2025-01-01T16:00:00.000Z',
  status: 'scheduled' as const,
  participantIds: ['player-a', 'player-b'],
}

const createDependencies = (evidence = pastEvidence) => {
  const reviewRepository = createInMemoryPlayerReviewRepository()
  return {
    reviewRepository,
    eligibilityReader: { getSessionEvidence: async () => evidence },
    createReviewId: createSha256ReviewId,
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  }
}

test('summary starts new and is calculated from reviews after publication', async () => {
  const dependencies = createDependencies()
  assert.deepEqual(await getPlayerTrustSummary(dependencies.reviewRepository, 'player-b'), {
    state: 'new', reviewCount: 0, recentReviews: [],
  })

  const result = await createPlayerReview(dependencies, {
    sessionId: 'past-session', reviewerId: 'player-a', reviewedPlayerId: 'player-b', rating: 4, comment: '  Buen ambiente.  ',
  })
  assert.equal(result.kind, 'created')
  const summary = await getPlayerTrustSummary(dependencies.reviewRepository, 'player-b')
  assert.equal(summary.state, 'rated')
  assert.equal(summary.reviewCount, 1)
  assert.equal(summary.averageRating, 4)
  assert.equal(summary.recentReviews[0]?.comment, 'Buen ambiente.')
})

test('a deterministic review id prevents duplicate reviews for the same relationship', async () => {
  const dependencies = createDependencies()
  const input = { sessionId: 'past-session', reviewerId: 'player-a', reviewedPlayerId: 'player-b', rating: 5 }
  assert.equal((await createPlayerReview(dependencies, input)).kind, 'created')
  assert.equal((await createPlayerReview(dependencies, input)).kind, 'duplicate')
})

test('provisional eligibility requires a past scheduled session and confirmed participants', async () => {
  const dependencies = createDependencies()
  assert.deepEqual(await getReviewEligibility(dependencies, 'past-session', 'player-a', 'player-b'), { kind: 'eligible' })
  assert.deepEqual(await getReviewEligibility(dependencies, 'past-session', 'player-a', 'player-a'), { kind: 'ineligible', reason: 'self-review' })
  const futureDependencies = createDependencies({ ...pastEvidence, startsAt: '2027-01-01T16:00:00.000Z' })
  assert.deepEqual(await getReviewEligibility(futureDependencies, 'past-session', 'player-a', 'player-b'), { kind: 'ineligible', reason: 'session-not-past' })
  const notStartedDependencies = createDependencies({ ...pastEvidence, startsAt: '2026-01-01T00:00:00.000Z' })
  assert.deepEqual(await getReviewEligibility(notStartedDependencies, 'past-session', 'player-a', 'player-b'), { kind: 'ineligible', reason: 'session-not-past' })
  const cancelledDependencies = createDependencies({ ...pastEvidence, status: 'cancelled' })
  assert.deepEqual(await getReviewEligibility(cancelledDependencies, 'past-session', 'player-a', 'player-b'), { kind: 'ineligible', reason: 'session-cancelled' })
})

test('reviewable participants exclude the reviewer and become submitted after review', async () => {
  const dependencies = createDependencies()
  assert.deepEqual(await getReviewablePlayersForSession(dependencies, 'past-session', 'player-a'), [{ playerId: 'player-b', reviewState: 'pending' }])
  await createPlayerReview(dependencies, { sessionId: 'past-session', reviewerId: 'player-a', reviewedPlayerId: 'player-b', rating: 3 })
  assert.deepEqual(await getReviewablePlayersForSession(dependencies, 'past-session', 'player-a'), [{ playerId: 'player-b', reviewState: 'submitted' }])
})
