import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { after, before, beforeEach, describe, test } from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

const projectId = process.env.MESA_ABIERTA_RULES_PROJECT_ID ?? 'demo-mesa-abierta'
const port = Number(process.env.MESA_ABIERTA_FIRESTORE_RULES_PORT ?? 8080)
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8')
let environment

const player = (displayName) => ({ displayName, city: 'Madrid', district: 'Centro', description: '' })
const betaTester = (active = true) => ({ active })
const session = (organizerId, overrides = {}) => ({
  gameName: 'Azul',
  startsAt: Timestamp.fromDate(new Date('2031-06-20T14:00:00.000Z')),
  city: 'Madrid',
  district: 'Centro',
  venue: '',
  description: '',
  capacity: 4,
  organizerId,
  participantIds: [organizerId],
  pendingRequestIds: [],
  status: 'scheduled',
  ...overrides,
})
const reviewId = (sessionId, reviewerId, reviewedPlayerId) => createHash('sha256')
  .update(JSON.stringify([sessionId, reviewerId, reviewedPlayerId]))
  .digest('hex')
const playerReview = (sessionId, reviewerId, reviewedPlayerId, overrides = {}) => ({
  id: reviewId(sessionId, reviewerId, reviewedPlayerId),
  sessionId,
  reviewerId,
  reviewedPlayerId,
  rating: 5,
  comment: 'Una partida agradable y bien organizada.',
  createdAt: serverTimestamp(),
  ...overrides,
})
const participationRequest = (sessionId, playerId, status = 'pending') => ({
  sessionId,
  playerId,
  status,
  createdAt: Timestamp.fromMillis(1),
})
const gameListing = (ownerId, overrides = {}) => {
  const listing = {
    ownerId,
    gameName: 'Catan',
    imageUrl: 'https://example.test/catan.webp',
    description: 'Completo y en buen estado.',
    condition: 'good',
    listingType: 'sale',
    priceInCents: 2500,
    city: 'Madrid',
    district: 'Centro',
    status: 'active',
    createdAt: Timestamp.fromMillis(1),
    ...overrides,
  }
  if (listing.listingType === 'trade') delete listing.priceInCents
  return listing
}
const listingInterest = (playerId, status = 'pending') => ({
  playerId,
  status,
  createdAt: Timestamp.fromMillis(2),
})
const contactHandoff = (playerId, ownerId = 'a', overrides = {}) => ({
  interestedPlayerId: playerId,
  sharedByOwnerId: ownerId,
  method: 'email',
  value: 'contacto@example.test',
  createdAt: Timestamp.fromMillis(3),
  ...overrides,
})

const dbFor = (uid) => environment.authenticatedContext(uid).firestore()
const anonymousDb = () => environment.unauthenticatedContext().firestore()

const seed = async (writes) => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await Promise.all(writes.map(([path, data]) => setDoc(doc(db, path), data)))
  })
}

const requestId = (sessionId, playerId) => `${sessionId}_${playerId}`

const createPendingRequest = async (db, sessionId, playerId, currentPending = []) => {
  const id = requestId(sessionId, playerId)
  const batch = writeBatch(db)
  batch.set(doc(db, 'participationRequests', id), {
    ...participationRequest(sessionId, playerId),
    createdAt: serverTimestamp(),
  })
  batch.update(doc(db, 'gameSessions', sessionId), { pendingRequestIds: [...currentPending, id] })
  return batch.commit()
}

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port, rules },
  })
})

beforeEach(async () => {
  await environment.clearFirestore()
  await seed(['a', 'b', 'c', 'd', 'e'].map((uid) => [`betaTesters/${uid}`, betaTester()]))
})
after(async () => environment.cleanup())

describe('closed beta access', () => {
  test('allows an authenticated user to read only their own beta status', async () => {
    await assertSucceeds(getDoc(doc(dbFor('a'), 'betaTesters', 'a')))
    await assertFails(getDoc(doc(dbFor('a'), 'betaTesters', 'b')))
    await assertFails(getDocs(collection(dbFor('a'), 'betaTesters')))
  })

  test('denies every client write to beta testers', async () => {
    await assertFails(setDoc(doc(dbFor('f'), 'betaTesters', 'f'), betaTester()))
    await assertFails(updateDoc(doc(dbFor('a'), 'betaTesters', 'a'), { active: false }))
    await assertFails(deleteDoc(doc(dbFor('a'), 'betaTesters', 'a')))
  })

  test('allows app data only to active beta testers', async () => {
    await seed([
      ['players/a', player('Ana')],
      ['betaTesters/f', betaTester(false)],
      ['players/f', player('Fuera de beta')],
      ['players/g', player('Sin invitación')],
    ])

    await assertSucceeds(getDoc(doc(dbFor('a'), 'players', 'a')))
    await assertSucceeds(getDoc(doc(dbFor('f'), 'betaTesters', 'f')))
    await assertFails(getDoc(doc(dbFor('f'), 'players', 'f')))
    await assertFails(getDoc(doc(dbFor('g'), 'players', 'g')))
    await assertFails(getDoc(doc(anonymousDb(), 'betaTesters', 'a')))
    await assertFails(getDoc(doc(anonymousDb(), 'players', 'a')))
  })
})

describe('players', () => {
  test('allows A to create/update own profile and B to read it', async () => {
    const a = dbFor('a')
    const b = dbFor('b')
    await assertSucceeds(setDoc(doc(a, 'players', 'a'), player('Ana')))
    await assertSucceeds(updateDoc(doc(a, 'players', 'a'), { displayName: 'Ana M.' }))
    await assertSucceeds(getDoc(doc(b, 'players', 'a')))
  })

  test('denies modifying another player or adding non-profile fields', async () => {
    await seed([['players/a', player('Ana')]])
    await assertFails(updateDoc(doc(dbFor('b'), 'players', 'a'), { displayName: 'Intruso' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'players', 'a'), { rating: 5 }))
    await assertFails(getDocs(collection(dbFor('b'), 'players')))
  })
})

describe('game sessions', () => {
  test('allows A to create, edit and cancel own session; B can read it', async () => {
    const a = dbFor('a')
    const reference = doc(a, 'gameSessions', 'session-a')
    await assertSucceeds(setDoc(reference, session('a')))
    await assertSucceeds(getDoc(doc(dbFor('b'), 'gameSessions', 'session-a')))
    await assertSucceeds(updateDoc(reference, {
      startsAt: Timestamp.fromDate(new Date('2031-06-20T15:30:00.000Z')),
      capacity: 3,
    }))
    await assertSucceeds(updateDoc(reference, { status: 'cancelled', pendingRequestIds: [] }))
  })

  test('denies a false organizer, non-organizer edits, over-capacity writes and hard delete', async () => {
    await seed([['gameSessions/session-a', session('a', { capacity: 2 })]])
    await assertFails(setDoc(doc(dbFor('b'), 'gameSessions', 'false-owner'), session('a')))
    await assertFails(updateDoc(doc(dbFor('b'), 'gameSessions', 'session-a'), { district: 'Retiro' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameSessions', 'session-a'), { organizerId: 'b' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameSessions', 'session-a'), { participantIds: ['a', 'b', 'c'] }))
    await assertFails(deleteDoc(doc(dbFor('a'), 'gameSessions', 'session-a')))
  })

  test('denies reducing capacity below confirmed participants', async () => {
    await seed([['gameSessions/session-a', session('a', { capacity: 4, participantIds: ['a', 'b', 'c'] })]])
    await assertFails(updateDoc(doc(dbFor('a'), 'gameSessions', 'session-a'), { capacity: 2 }))
  })

  test('requires a timestamp startsAt and rejects legacy civil time on new sessions', async () => {
    const missingStartsAt = session('a')
    delete missingStartsAt.startsAt
    await assertFails(setDoc(
      doc(dbFor('a'), 'gameSessions', 'missing-starts-at'),
      missingStartsAt,
    ))
    await assertFails(setDoc(
      doc(dbFor('a'), 'gameSessions', 'invalid-starts-at'),
      session('a', { startsAt: '2031-06-20T14:00:00.000Z' }),
    ))
    await assertFails(setDoc(
      doc(dbFor('a'), 'gameSessions', 'legacy-civil-time'),
      session('a', { date: '2031-06-20', time: '16:00' }),
    ))
  })

  test('locks legacy date/time fields and denies rescheduling after startsAt', async () => {
    await seed([
      ['gameSessions/legacy-session', session('a', { date: '2031-06-20', time: '16:00' })],
      ['gameSessions/past-session', session('a', {
        startsAt: Timestamp.fromDate(new Date('2020-01-20T15:00:00.000Z')),
      })],
    ])
    await assertFails(updateDoc(
      doc(dbFor('a'), 'gameSessions', 'legacy-session'),
      { date: '2031-06-21', time: '16:00' },
    ))
    await assertFails(updateDoc(
      doc(dbFor('a'), 'gameSessions', 'past-session'),
      { startsAt: Timestamp.fromDate(new Date('2031-06-20T14:00:00.000Z')) },
    ))
    await assertSucceeds(updateDoc(
      doc(dbFor('a'), 'gameSessions', 'past-session'),
      { status: 'cancelled', pendingRequestIds: [] },
    ))
  })
})

describe('player reviews', () => {
  const pastSession = (overrides = {}) => session('a', {
    startsAt: Timestamp.fromDate(new Date('2020-01-20T17:30:00.000Z')),
    participantIds: ['a', 'b'],
    ...overrides,
  })

  const seedEligibleReview = async (overrides = {}) => seed([
    ['players/a', player('Ana')],
    ['players/b', player('Berta')],
    ['players/c', player('Carlos')],
    ['gameSessions/review-session', pastSession(overrides)],
  ])

  test('allows an eligible participant to create once and another authenticated user to read', async () => {
    await seedEligibleReview()
    const data = playerReview('review-session', 'a', 'b')
    const reference = doc(dbFor('a'), 'playerReviews', data.id)
    await assertSucceeds(setDoc(reference, data))
    await assertSucceeds(getDoc(doc(dbFor('c'), 'playerReviews', data.id)))
  })

  test('denies anonymous review access', async () => {
    await seedEligibleReview()
    const data = playerReview('review-session', 'a', 'b')
    await assertFails(setDoc(doc(anonymousDb(), 'playerReviews', data.id), data))
    await seed([['playerReviews/existing-review', {
      ...data,
      id: 'existing-review',
      createdAt: Timestamp.fromMillis(1),
    }]])
    await assertFails(getDoc(doc(anonymousDb(), 'playerReviews', 'existing-review')))
  })

  test('denies self-review and forged reviewer identity', async () => {
    await seedEligibleReview()
    const selfReview = playerReview('review-session', 'a', 'a')
    await assertFails(setDoc(doc(dbFor('a'), 'playerReviews', selfReview.id), selfReview))
    const forgedReview = playerReview('review-session', 'a', 'b')
    await assertFails(setDoc(doc(dbFor('c'), 'playerReviews', forgedReview.id), forgedReview))
  })

  test('denies a reviewer or reviewed player outside participantIds', async () => {
    await seedEligibleReview()
    const nonParticipantReviewer = playerReview('review-session', 'c', 'b')
    await assertFails(setDoc(
      doc(dbFor('c'), 'playerReviews', nonParticipantReviewer.id),
      nonParticipantReviewer,
    ))
    const nonParticipantReviewed = playerReview('review-session', 'a', 'c')
    await assertFails(setDoc(
      doc(dbFor('a'), 'playerReviews', nonParticipantReviewed.id),
      nonParticipantReviewed,
    ))
  })

  test('denies reviews when either player document is missing', async () => {
    await seed([
      ['players/a', player('Ana')],
      ['gameSessions/review-session', pastSession()],
    ])
    const missingReviewedPlayer = playerReview('review-session', 'a', 'b')
    await assertFails(setDoc(
      doc(dbFor('a'), 'playerReviews', missingReviewedPlayer.id),
      missingReviewedPlayer,
    ))

    await environment.clearFirestore()
    await seed([
      ['players/b', player('Berta')],
      ['gameSessions/review-session', pastSession()],
    ])
    const missingReviewerPlayer = playerReview('review-session', 'a', 'b')
    await assertFails(setDoc(
      doc(dbFor('a'), 'playerReviews', missingReviewerPlayer.id),
      missingReviewerPlayer,
    ))
  })

  test('denies reviews for future or cancelled sessions', async () => {
    await seedEligibleReview({ startsAt: Timestamp.fromDate(new Date('2031-01-20T17:30:00.000Z')) })
    const futureReview = playerReview('review-session', 'a', 'b')
    await assertFails(setDoc(doc(dbFor('a'), 'playerReviews', futureReview.id), futureReview))

    await environment.clearFirestore()
    await seedEligibleReview({ status: 'cancelled' })
    const cancelledReview = playerReview('review-session', 'a', 'b')
    await assertFails(setDoc(doc(dbFor('a'), 'playerReviews', cancelledReview.id), cancelledReview))
  })

  test('denies ratings outside integer 1..5', async () => {
    for (const [suffix, rating] of [['zero', 0], ['six', 6], ['decimal', 4.5]]) {
      await environment.clearFirestore()
      const sessionId = `rating-${suffix}`
      await seed([
        ['players/a', player('Ana')],
        ['players/b', player('Berta')],
        [`gameSessions/${sessionId}`, pastSession()],
      ])
      const data = playerReview(sessionId, 'a', 'b', { rating })
      await assertFails(setDoc(doc(dbFor('a'), 'playerReviews', data.id), data))
    }
  })

  test('denies oversized comments, extra fields and a forged createdAt', async () => {
    await seedEligibleReview()
    const tooLong = playerReview('review-session', 'a', 'b', { comment: 'x'.repeat(501) })
    await assertFails(setDoc(doc(dbFor('a'), 'playerReviews', tooLong.id), tooLong))
    const extraField = playerReview('review-session', 'a', 'b', { moderationState: 'visible' })
    await assertFails(setDoc(doc(dbFor('a'), 'playerReviews', extraField.id), extraField))
    const falseTimestamp = playerReview('review-session', 'a', 'b', {
      createdAt: Timestamp.fromMillis(1),
    })
    await assertFails(setDoc(doc(dbFor('a'), 'playerReviews', falseTimestamp.id), falseTimestamp))
  })

  test('denies an incorrect hash and a duplicate deterministic review', async () => {
    await seedEligibleReview()
    const invalidId = 'a'.repeat(64)
    const invalidHash = playerReview('review-session', 'a', 'b', { id: invalidId })
    await assertFails(setDoc(doc(dbFor('a'), 'playerReviews', invalidId), invalidHash))

    const data = playerReview('review-session', 'a', 'b')
    const reference = doc(dbFor('a'), 'playerReviews', data.id)
    await assertSucceeds(setDoc(reference, data))
    await assertFails(setDoc(reference, data))
  })

  test('denies update and delete for every client', async () => {
    await seedEligibleReview()
    const id = reviewId('review-session', 'a', 'b')
    await seed([['playerReviews/' + id, {
      ...playerReview('review-session', 'a', 'b'),
      createdAt: Timestamp.fromMillis(1),
    }]])
    const reference = doc(dbFor('a'), 'playerReviews', id)
    await assertFails(updateDoc(reference, { rating: 4 }))
    await assertFails(deleteDoc(reference))
  })
})

describe('participation requests', () => {
  test('allows B to request for self and limits reads to B and organizer A', async () => {
    await seed([['gameSessions/session-a', session('a')]])
    const b = dbFor('b')
    await assertSucceeds(createPendingRequest(b, 'session-a', 'b'))
    await assertSucceeds(getDoc(doc(b, 'participationRequests', requestId('session-a', 'b'))))
    await assertSucceeds(getDocs(query(collection(b, 'participationRequests'), where('playerId', '==', 'b'))))
    await assertSucceeds(getDocs(query(collection(dbFor('a'), 'participationRequests'), where('sessionId', '==', 'session-a'))))
    await assertFails(getDoc(doc(dbFor('c'), 'participationRequests', requestId('session-a', 'b'))))
  })

  test('allows organizer A to confirm and reject pending requests atomically', async () => {
    const bRequest = requestId('session-a', 'b')
    await seed([
      ['gameSessions/session-a', session('a', { pendingRequestIds: [bRequest] })],
      [`participationRequests/${bRequest}`, participationRequest('session-a', 'b')],
    ])
    const a = dbFor('a')
    const confirmation = writeBatch(a)
    confirmation.update(doc(a, 'gameSessions', 'session-a'), { participantIds: ['a', 'b'], pendingRequestIds: [] })
    confirmation.update(doc(a, 'participationRequests', bRequest), { status: 'confirmed' })
    await assertSucceeds(confirmation.commit())

    const cRequest = requestId('session-c', 'c')
    await seed([
      ['gameSessions/session-c', session('a', { pendingRequestIds: [cRequest] })],
      [`participationRequests/${cRequest}`, participationRequest('session-c', 'c')],
    ])
    const rejection = writeBatch(a)
    rejection.update(doc(a, 'gameSessions', 'session-c'), { pendingRequestIds: [] })
    rejection.update(doc(a, 'participationRequests', cRequest), { status: 'rejected' })
    await assertSucceeds(rejection.commit())
  })

  test('allows organizer cancellation to close a pending request', async () => {
    const bRequest = requestId('session-a', 'b')
    await seed([
      ['gameSessions/session-a', session('a', { pendingRequestIds: [bRequest] })],
      [`participationRequests/${bRequest}`, participationRequest('session-a', 'b')],
    ])
    const a = dbFor('a')
    const cancellation = writeBatch(a)
    cancellation.update(doc(a, 'gameSessions', 'session-a'), { status: 'cancelled', pendingRequestIds: [] })
    cancellation.update(doc(a, 'participationRequests', bRequest), { status: 'rejected' })
    await assertSucceeds(cancellation.commit())
  })

  test('allows the last seat and closes every remaining pending request', async () => {
    const bRequest = requestId('session-a', 'b')
    const cRequest = requestId('session-a', 'c')
    await seed([
      ['gameSessions/session-a', session('a', { capacity: 2, pendingRequestIds: [bRequest, cRequest] })],
      [`participationRequests/${bRequest}`, participationRequest('session-a', 'b')],
      [`participationRequests/${cRequest}`, participationRequest('session-a', 'c')],
    ])
    const a = dbFor('a')
    const resolution = writeBatch(a)
    resolution.update(doc(a, 'gameSessions', 'session-a'), { participantIds: ['a', 'b'], pendingRequestIds: [] })
    resolution.update(doc(a, 'participationRequests', bRequest), { status: 'confirmed' })
    resolution.update(doc(a, 'participationRequests', cRequest), { status: 'rejected' })
    await assertSucceeds(resolution.commit())
  })

  test('denies impersonation, self-confirmation and modifying another request', async () => {
    await seed([['gameSessions/session-a', session('a')]])
    const b = dbFor('b')
    const fakeId = requestId('session-a', 'c')
    const impersonation = writeBatch(b)
    impersonation.set(doc(b, 'participationRequests', fakeId), participationRequest('session-a', 'c'))
    impersonation.update(doc(b, 'gameSessions', 'session-a'), { pendingRequestIds: [fakeId] })
    await assertFails(impersonation.commit())
    await assertFails(setDoc(
      doc(b, 'participationRequests', requestId('session-a', 'b')),
      participationRequest('session-a', 'b'),
    ))

    const bRequest = requestId('session-a', 'b')
    await seed([
      ['gameSessions/session-a', session('a', { pendingRequestIds: [bRequest] })],
      [`participationRequests/${bRequest}`, participationRequest('session-a', 'b')],
    ])
    const selfConfirmation = writeBatch(b)
    selfConfirmation.update(doc(b, 'gameSessions', 'session-a'), { participantIds: ['a', 'b'], pendingRequestIds: [] })
    selfConfirmation.update(doc(b, 'participationRequests', bRequest), { status: 'confirmed' })
    await assertFails(selfConfirmation.commit())
    await assertFails(updateDoc(doc(dbFor('c'), 'participationRequests', bRequest), { status: 'rejected' }))
  })

  test('denies unlinking a pending request without resolving it', async () => {
    const bRequest = requestId('session-a', 'b')
    await seed([
      ['gameSessions/session-a', session('a', { pendingRequestIds: [bRequest] })],
      [`participationRequests/${bRequest}`, participationRequest('session-a', 'b')],
    ])
    await assertFails(updateDoc(
      doc(dbFor('a'), 'gameSessions', 'session-a'),
      { pendingRequestIds: [] },
    ))
  })

  test('denies non-organizer resolution, over-capacity acceptance and requests on cancelled sessions', async () => {
    const bRequest = requestId('session-a', 'b')
    await seed([
      ['gameSessions/session-a', session('a', { capacity: 2, pendingRequestIds: [bRequest] })],
      [`participationRequests/${bRequest}`, participationRequest('session-a', 'b')],
      ['gameSessions/cancelled', session('a', { status: 'cancelled' })],
    ])
    const c = dbFor('c')
    const unauthorized = writeBatch(c)
    unauthorized.update(doc(c, 'gameSessions', 'session-a'), { pendingRequestIds: [] })
    unauthorized.update(doc(c, 'participationRequests', bRequest), { status: 'rejected' })
    await assertFails(unauthorized.commit())

    const a = dbFor('a')
    const overCapacity = writeBatch(a)
    overCapacity.update(doc(a, 'gameSessions', 'session-a'), { participantIds: ['a', 'b', 'c'], pendingRequestIds: [] })
    overCapacity.update(doc(a, 'participationRequests', bRequest), { status: 'confirmed' })
    await assertFails(overCapacity.commit())
    await assertFails(createPendingRequest(dbFor('b'), 'cancelled', 'b'))
  })

  test('denies requests and participant confirmation after startsAt', async () => {
    const bRequest = requestId('past-session', 'b')
    await seed([
      ['gameSessions/past-session', session('a', {
        startsAt: Timestamp.fromDate(new Date('2020-01-20T15:00:00.000Z')),
      })],
    ])
    await assertFails(createPendingRequest(dbFor('b'), 'past-session', 'b'))

    await seed([
      ['gameSessions/past-session', session('a', {
        startsAt: Timestamp.fromDate(new Date('2020-01-20T15:00:00.000Z')),
        pendingRequestIds: [bRequest],
      })],
      [`participationRequests/${bRequest}`, participationRequest('past-session', 'b')],
    ])
    const a = dbFor('a')
    const acceptance = writeBatch(a)
    acceptance.update(doc(a, 'gameSessions', 'past-session'), {
      participantIds: ['a', 'b'],
      pendingRequestIds: [],
    })
    acceptance.update(doc(a, 'participationRequests', bRequest), { status: 'confirmed' })
    await assertFails(acceptance.commit())
  })
})

describe('game listings', () => {
  test('allows an owner lifecycle, authenticated discovery and own closed history', async () => {
    const a = dbFor('a')
    const listingReference = doc(a, 'gameListings', 'listing-a')
    await assertSucceeds(setDoc(listingReference, {
      ...gameListing('a'),
      createdAt: serverTimestamp(),
    }))
    await assertSucceeds(getDoc(doc(dbFor('b'), 'gameListings', 'listing-a')))
    await assertSucceeds(getDocs(query(
      collection(dbFor('b'), 'gameListings'),
      where('status', '==', 'active'),
    )))
    await assertSucceeds(updateDoc(listingReference, { description: 'Actualizado por su propietario.' }))
    await assertSucceeds(updateDoc(listingReference, { status: 'closed' }))
    await assertSucceeds(getDoc(listingReference))
    await assertSucceeds(getDocs(query(
      collection(a, 'gameListings'),
      where('ownerId', '==', 'a'),
    )))
  })

  test('allows a prior interested player to read closed history but denies unrelated users', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a', { status: 'closed' })],
      ['gameListings/listing-a/interests/b', listingInterest('b', 'accepted')],
    ])
    await assertSucceeds(getDoc(doc(dbFor('b'), 'gameListings', 'listing-a')))
    await assertFails(getDoc(doc(dbFor('c'), 'gameListings', 'listing-a')))
    await assertFails(getDoc(doc(anonymousDb(), 'gameListings', 'listing-a')))
  })

  test('denies impersonation, foreign edits, immutable-field changes, arbitrary fields and delete', async () => {
    await seed([['gameListings/listing-a', gameListing('a')]])
    await assertFails(setDoc(doc(dbFor('b'), 'gameListings', 'false-owner'), gameListing('a')))
    await assertFails(updateDoc(doc(dbFor('b'), 'gameListings', 'listing-a'), { description: 'Intrusión' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a'), { ownerId: 'b' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a'), { createdAt: Timestamp.fromMillis(9) }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a'), { promoted: true }))
    await assertFails(deleteDoc(doc(dbFor('a'), 'gameListings', 'listing-a')))
    await assertFails(setDoc(doc(anonymousDb(), 'gameListings', 'anonymous'), gameListing('anonymous')))
  })

  test('denies malformed modality, price, condition, city and timestamp', async () => {
    const a = dbFor('a')
    const saleWithoutPrice = gameListing('a')
    delete saleWithoutPrice.priceInCents
    await assertFails(setDoc(doc(a, 'gameListings', 'sale-without-price'), saleWithoutPrice))
    await assertFails(setDoc(doc(a, 'gameListings', 'invalid-price'), gameListing('a', { priceInCents: 0 })))
    await assertFails(setDoc(doc(a, 'gameListings', 'trade-with-price'), {
      ...gameListing('a', { listingType: 'trade' }),
      priceInCents: 1000,
    }))
    await assertFails(setDoc(doc(a, 'gameListings', 'invalid-condition'), gameListing('a', { condition: 'broken' })))
    await assertFails(setDoc(doc(a, 'gameListings', 'invalid-city'), gameListing('a', { city: 'Barcelona' })))
    await assertFails(setDoc(doc(a, 'gameListings', 'invalid-timestamp'), gameListing('a', { createdAt: 'hoy' })))
  })

  test('enforces close as a terminal status-only transition', async () => {
    await seed([
      ['gameListings/closed', gameListing('a', { status: 'closed' })],
      ['gameListings/active', gameListing('a')],
    ])
    const a = dbFor('a')
    await assertFails(updateDoc(doc(a, 'gameListings', 'closed'), { status: 'active' }))
    await assertFails(updateDoc(doc(a, 'gameListings', 'closed'), { description: 'No editable' }))
    await assertFails(updateDoc(doc(a, 'gameListings', 'active'), {
      status: 'closed',
      description: 'Cierre con edición simultánea',
    }))
  })
})

describe('listing interests', () => {
  test('allows self pending creation, private reads and owner resolution', async () => {
    await seed([['gameListings/listing-a', gameListing('a')]])
    const b = dbFor('b')
    const interestReference = doc(b, 'gameListings', 'listing-a', 'interests', 'b')
    await assertSucceeds(setDoc(interestReference, {
      ...listingInterest('b'),
      createdAt: serverTimestamp(),
    }))
    await assertSucceeds(getDoc(interestReference))
    await assertSucceeds(getDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'b')))
    await assertSucceeds(getDocs(collection(dbFor('a'), 'gameListings', 'listing-a', 'interests')))
    await assertSucceeds(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'b'), { status: 'accepted' }))

    await seed([['gameListings/listing-a/interests/c', listingInterest('c')]])
    await assertSucceeds(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'c'), { status: 'declined' }))
  })

  test('denies self-interest, direct acceptance, impersonation, duplicates and missing parents', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a')],
      ['gameListings/listing-a/interests/b', listingInterest('b')],
    ])
    await assertFails(setDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'a'), listingInterest('a')))
    await assertFails(setDoc(doc(dbFor('c'), 'gameListings', 'listing-a', 'interests', 'c'), listingInterest('c', 'accepted')))
    await assertFails(setDoc(doc(dbFor('b'), 'gameListings', 'listing-a', 'interests', 'c'), listingInterest('c')))
    await assertFails(setDoc(doc(dbFor('b'), 'gameListings', 'missing', 'interests', 'b'), listingInterest('b')))
    await assertFails(setDoc(doc(dbFor('b'), 'gameListings', 'listing-a', 'interests', 'b'), listingInterest('b')))
  })

  test('denies third-party reads and broad listing of private interests', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a')],
      ['gameListings/listing-a/interests/b', listingInterest('b')],
    ])
    await assertFails(getDoc(doc(dbFor('c'), 'gameListings', 'listing-a', 'interests', 'b')))
    await assertFails(getDocs(collection(dbFor('c'), 'gameListings', 'listing-a', 'interests')))
  })

  test('denies self-resolution, third-party changes, terminal transitions, timestamp changes and delete', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a')],
      ['gameListings/listing-a/interests/b', listingInterest('b')],
      ['gameListings/listing-a/interests/c', listingInterest('c', 'accepted')],
      ['gameListings/listing-a/interests/d', listingInterest('d', 'declined')],
    ])
    await assertFails(updateDoc(doc(dbFor('b'), 'gameListings', 'listing-a', 'interests', 'b'), { status: 'accepted' }))
    await assertFails(updateDoc(doc(dbFor('e'), 'gameListings', 'listing-a', 'interests', 'b'), { status: 'declined' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'c'), { status: 'declined' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'c'), { status: 'pending' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'd'), { status: 'accepted' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'b'), {
      status: 'accepted',
      createdAt: Timestamp.fromMillis(99),
    }))
    await assertFails(deleteDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'b')))
  })

  test('denies resolving pending interests after the listing is closed', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a', { status: 'closed' })],
      ['gameListings/listing-a/interests/b', listingInterest('b')],
    ])
    await assertFails(updateDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'interests', 'b'), { status: 'accepted' }))
  })
})

describe('listing contact handoffs', () => {
  test('allows the owner to create/update contact for an accepted interest and both parties to read it', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a')],
      ['gameListings/listing-a/interests/b', listingInterest('b', 'accepted')],
    ])
    const reference = doc(dbFor('a'), 'gameListings', 'listing-a', 'contactHandoffs', 'b')
    await assertSucceeds(setDoc(reference, contactHandoff('b')))
    await assertSucceeds(getDoc(reference))
    await assertSucceeds(getDoc(doc(dbFor('b'), 'gameListings', 'listing-a', 'contactHandoffs', 'b')))
    await assertSucceeds(updateDoc(reference, { method: 'phone', value: '+34 600 000 000' }))
  })

  test('denies handoffs for pending or declined interests', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a')],
      ['gameListings/listing-a/interests/b', listingInterest('b')],
      ['gameListings/listing-a/interests/c', listingInterest('c', 'declined')],
    ])
    await assertFails(setDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'contactHandoffs', 'b'), contactHandoff('b')))
    await assertFails(setDoc(doc(dbFor('a'), 'gameListings', 'listing-a', 'contactHandoffs', 'c'), contactHandoff('c')))
  })

  test('denies recipient writes, third-party reads, listing and client deletion', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a')],
      ['gameListings/listing-a/interests/b', listingInterest('b', 'accepted')],
      ['gameListings/listing-a/contactHandoffs/b', contactHandoff('b')],
    ])
    const path = ['gameListings', 'listing-a', 'contactHandoffs', 'b']
    await assertFails(setDoc(doc(dbFor('b'), ...path), contactHandoff('b')))
    await assertFails(updateDoc(doc(dbFor('b'), ...path), { value: 'otro@example.test' }))
    await assertFails(getDoc(doc(dbFor('c'), ...path)))
    await assertFails(getDocs(collection(dbFor('a'), 'gameListings', 'listing-a', 'contactHandoffs')))
    await assertFails(deleteDoc(doc(dbFor('a'), ...path)))
  })

  test('denies forged identity, arbitrary fields, invalid values and immutable timestamp changes', async () => {
    await seed([
      ['gameListings/listing-a', gameListing('a')],
      ['gameListings/listing-a/interests/b', listingInterest('b', 'accepted')],
    ])
    const reference = doc(dbFor('a'), 'gameListings', 'listing-a', 'contactHandoffs', 'b')
    await assertFails(setDoc(reference, contactHandoff('c')))
    await assertFails(setDoc(reference, contactHandoff('b', 'c')))
    await assertFails(setDoc(reference, contactHandoff('b', 'a', { method: 'social' })))
    await assertFails(setDoc(reference, contactHandoff('b', 'a', { value: '' })))
    await assertFails(setDoc(reference, { ...contactHandoff('b'), internalNote: 'privado' }))
    await assertFails(setDoc(reference, contactHandoff('b', 'a', { createdAt: 'hoy' })))

    await seed([['gameListings/listing-a/contactHandoffs/b', contactHandoff('b')]])
    await assertFails(updateDoc(reference, { createdAt: Timestamp.fromMillis(99) }))
    await assertFails(updateDoc(reference, { extra: true }))
  })
})

test('denies unauthenticated access to protected data', async () => {
  await seed([
    ['players/a', player('Ana')],
    ['gameSessions/session-a', session('a')],
    [`participationRequests/${requestId('session-a', 'b')}`, participationRequest('session-a', 'b')],
    ['gameListings/listing-a', gameListing('a')],
    ['gameListings/listing-a/interests/b', listingInterest('b')],
    ['gameListings/listing-a/contactHandoffs/b', contactHandoff('b')],
  ])
  const db = anonymousDb()
  await assertFails(getDoc(doc(db, 'players', 'a')))
  await assertFails(getDoc(doc(db, 'gameSessions', 'session-a')))
  await assertFails(getDoc(doc(db, 'participationRequests', requestId('session-a', 'b'))))
  await assertFails(setDoc(doc(db, 'players', 'anonymous'), player('Anónimo')))
  await assertFails(setDoc(doc(db, 'gameSessions', 'anonymous-session'), session('anonymous')))
  await assertFails(setDoc(
    doc(db, 'participationRequests', requestId('session-a', 'anonymous')),
    participationRequest('session-a', 'anonymous'),
  ))
  await assertFails(getDoc(doc(db, 'gameListings', 'listing-a')))
  await assertFails(getDoc(doc(db, 'gameListings', 'listing-a', 'interests', 'b')))
  await assertFails(getDoc(doc(db, 'gameListings', 'listing-a', 'contactHandoffs', 'b')))
})
