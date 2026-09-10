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

const projectId = 'demo-mesa-abierta'
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8')
let environment

const player = (displayName) => ({ displayName, city: 'Madrid', district: 'Centro', description: '' })
const session = (organizerId, overrides = {}) => ({
  gameName: 'Azul',
  date: '2031-06-20',
  time: '16:00',
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
const participationRequest = (sessionId, playerId, status = 'pending') => ({
  sessionId,
  playerId,
  status,
  createdAt: Timestamp.fromMillis(1),
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
    firestore: { host: '127.0.0.1', port: 8080, rules },
  })
})

beforeEach(async () => environment.clearFirestore())
after(async () => environment.cleanup())

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
    await assertSucceeds(updateDoc(reference, { time: '17:30', capacity: 3 }))
    await assertSucceeds(updateDoc(reference, { status: 'cancelled', pendingRequestIds: [] }))
  })

  test('denies a false organizer, non-organizer edits, over-capacity writes and hard delete', async () => {
    await seed([['gameSessions/session-a', session('a', { capacity: 2 })]])
    await assertFails(setDoc(doc(dbFor('b'), 'gameSessions', 'false-owner'), session('a')))
    await assertFails(updateDoc(doc(dbFor('b'), 'gameSessions', 'session-a'), { time: '18:00' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameSessions', 'session-a'), { organizerId: 'b' }))
    await assertFails(updateDoc(doc(dbFor('a'), 'gameSessions', 'session-a'), { participantIds: ['a', 'b', 'c'] }))
    await assertFails(deleteDoc(doc(dbFor('a'), 'gameSessions', 'session-a')))
  })

  test('denies reducing capacity below confirmed participants', async () => {
    await seed([['gameSessions/session-a', session('a', { capacity: 4, participantIds: ['a', 'b', 'c'] })]])
    await assertFails(updateDoc(doc(dbFor('a'), 'gameSessions', 'session-a'), { capacity: 2 }))
  })

  test('denies malformed civil dates and times', async () => {
    await assertFails(setDoc(
      doc(dbFor('a'), 'gameSessions', 'invalid-time'),
      session('a', { time: '25:00' }),
    ))
    await assertFails(setDoc(
      doc(dbFor('a'), 'gameSessions', 'invalid-date'),
      session('a', { date: '2031-13-40' }),
    ))
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
})

test('denies unauthenticated access to protected data', async () => {
  await seed([
    ['players/a', player('Ana')],
    ['gameSessions/session-a', session('a')],
    [`participationRequests/${requestId('session-a', 'b')}`, participationRequest('session-a', 'b')],
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
})
