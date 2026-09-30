import assert from 'node:assert/strict'
import test from 'node:test'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore'
import { observeSessionFeed, type SessionFeedState } from '../src/game-sessions/application/observeSessionFeed.ts'
import { createFirestoreGameSessionRepository } from '../src/game-sessions/infrastructure/firestoreGameSessionRepository.ts'
import { createFirestoreParticipationRequestRepository } from '../src/game-sessions/infrastructure/firestoreParticipationRequestRepository.ts'

const projectId = process.env.MESA_ABIERTA_GAME_SESSION_PROJECT_ID
  ?? 'demo-mesa-abierta-game-session-tests'
const port = Number(process.env.MESA_ABIERTA_GAME_SESSION_PORT ?? '8180')

const input = (game: string, time = '16:00') => ({
  game,
  date: '2031-06-20',
  time,
  zone: 'Centro',
  place: 'Café Mesa',
  capacity: 4,
  description: 'Partida local',
})

const collectFeed = (
  sessionRepository: ReturnType<typeof createFirestoreGameSessionRepository>,
  requestRepository: ReturnType<typeof createFirestoreParticipationRequestRepository>,
  playerId: string,
) => {
  let latest: SessionFeedState | null = null
  const states: SessionFeedState[] = []
  const waiters = new Set<() => void>()
  const feed = observeSessionFeed(sessionRepository, requestRepository, playerId, (state) => {
    latest = state
    states.push(state)
    waiters.forEach((notify) => notify())
  })
  const waitFor = (predicate: (state: SessionFeedState) => boolean, label: string) => new Promise<SessionFeedState>((resolve, reject) => {
    const inspect = () => {
      if (!latest || !predicate(latest)) return
      clearTimeout(timeout)
      waiters.delete(inspect)
      resolve(latest)
    }
    const timeout = setTimeout(() => {
      waiters.delete(inspect)
      reject(new Error(`Timed out waiting for ${label}; latest: ${JSON.stringify(latest)}`))
    }, 10000)
    waiters.add(inspect)
    inspect()
  })
  return { feed, states, waitFor }
}

test('two authorized clients see requests, resolution and session lifecycle without rereading', async () => {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port },
  })
  let belialFeed: ReturnType<typeof collectFeed> | null = null
  let redonFeed: ReturnType<typeof collectFeed> | null = null
  try {
    await environment.clearFirestore()
    await environment.withSecurityRulesDisabled(async (context) => {
      const database = context.firestore()
      await Promise.all(['belial', 'redon'].map((id) =>
        setDoc(doc(database, 'betaTesters', id), { active: true }),
      ))
    })

    const belialDb = environment.authenticatedContext('belial').firestore()
    const redonDb = environment.authenticatedContext('redon').firestore()
    const belialSessions = createFirestoreGameSessionRepository(belialDb)
    const redonSessions = createFirestoreGameSessionRepository(redonDb)
    const belialRequests = createFirestoreParticipationRequestRepository(belialDb)
    const redonRequests = createFirestoreParticipationRequestRepository(redonDb)
    belialFeed = collectFeed(belialSessions, belialRequests, 'belial')
    redonFeed = collectFeed(redonSessions, redonRequests, 'redon')
    await Promise.all([
      belialFeed.waitFor((state) => !state.loading && !state.error, 'Belial initial delivery'),
      redonFeed.waitFor((state) => !state.loading && !state.error, 'Redon initial delivery'),
    ])

    const created = await belialSessions.create(input('Azul'), 'belial')
    await Promise.all([
      belialFeed.waitFor((state) => !state.loading && state.sessions.some((item) => item.id === created.id), 'Belial confirmed creation from listener'),
      redonFeed.waitFor((state) => !state.loading && state.sessions.some((item) => item.id === created.id), 'Redon discovery'),
    ])

    await redonRequests.requestParticipation(created.id, 'redon')
    await Promise.all([
      belialFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.requests.some(
        (item) => item.playerId === 'redon' && item.status === 'pending',
      ) ?? false, 'Belial pending request'),
      redonFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.requests.some(
        (item) => item.playerId === 'redon' && item.status === 'pending',
      ) ?? false, 'Redon pending status'),
    ])

    await belialRequests.acceptParticipationRequest(created.id, 'redon', 'belial')
    const isConfirmed = (state: SessionFeedState) => {
      const item = state.sessions.find((session) => session.id === created.id)
      return Boolean(item?.participantIds.includes('redon')
        && item.requests.some((request) => request.playerId === 'redon' && request.status === 'confirmed'))
    }
    await Promise.all([
      belialFeed.waitFor((state) => {
        const item = state.sessions.find((session) => session.id === created.id)
        return Boolean(item?.participantIds.includes('redon') && !item.requests.some((request) => request.status === 'pending'))
      }, 'Belial confirmed status'),
      redonFeed.waitFor(isConfirmed, 'Redon confirmed status'),
    ])

    const rejectedSession = await belialSessions.create(input('Wingspan'), 'belial')
    await redonFeed.waitFor((state) => state.sessions.some((item) => item.id === rejectedSession.id), 'second session discovery')
    await redonRequests.requestParticipation(rejectedSession.id, 'redon')
    await Promise.all([
      belialFeed.waitFor((state) => state.sessions.find((item) => item.id === rejectedSession.id)?.requests.some(
        (item) => item.playerId === 'redon' && item.status === 'pending',
      ) ?? false, 'Belial second pending request'),
      redonFeed.waitFor((state) => state.sessions.find((item) => item.id === rejectedSession.id)?.requests.some(
        (item) => item.playerId === 'redon' && item.status === 'pending',
      ) ?? false, 'Redon second pending request'),
    ])
    await belialRequests.rejectParticipationRequest(rejectedSession.id, 'redon', 'belial')
    await Promise.all([
      belialFeed.waitFor((state) => !state.sessions.find((item) => item.id === rejectedSession.id)?.requests.some(
        (item) => item.status === 'pending',
      ), 'Belial rejected status'),
      redonFeed.waitFor((state) => state.sessions.find((item) => item.id === rejectedSession.id)?.requests.some(
        (item) => item.playerId === 'redon' && item.status === 'rejected',
      ) ?? false, 'Redon rejected status'),
    ])

    await belialSessions.update(created.id, { ...input('Azul', '17:30'), place: 'Sala nueva' }, 'belial')
    await Promise.all([
      belialFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.place === 'Sala nueva', 'Belial confirmed edit'),
      redonFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.place === 'Sala nueva', 'Redon observed edit'),
    ])
    await belialSessions.cancel(created.id, 'belial')
    const [belialCancelled, redonCancelled] = await Promise.all([
      belialFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.lifecycle === 'cancelled', 'Belial confirmed cancellation'),
      redonFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.lifecycle === 'cancelled', 'Redon observed cancellation'),
    ])
    assert.equal(belialCancelled.sessions.find((item) => item.id === created.id)?.place, 'Sala nueva')
    assert.equal(redonCancelled.sessions.find((item) => item.id === created.id)?.place, 'Sala nueva')

    await assert.rejects(setDoc(doc(belialDb, 'gameSessions', 'invalid-local-write'), { gameName: 'Invalid' }))
    assert.ok(!belialFeed.states.some((state) => state.sessions.some((item) => item.id === 'invalid-local-write')),
      'A rejected local write must never appear as a confirmed session')
  } finally {
    belialFeed?.feed.stop()
    redonFeed?.feed.stop()
    await environment.cleanup()
  }
})

test('legacy names and optional catalog IDs survive repository reads, writes, edits and realtime delivery', async () => {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port },
  })
  let redonFeed: ReturnType<typeof collectFeed> | null = null
  try {
    await environment.clearFirestore()
    await environment.withSecurityRulesDisabled(async (context) => {
      const database = context.firestore()
      await Promise.all([
        setDoc(doc(database, 'betaTesters', 'belial'), { active: true }),
        setDoc(doc(database, 'betaTesters', 'redon'), { active: true }),
        setDoc(doc(database, 'gameSessions', 'legacy-name-only'), {
          gameName: 'Root', startsAt: Timestamp.fromDate(new Date('2031-06-20T14:00:00.000Z')),
          city: 'Madrid', district: 'Centro', capacity: 4, organizerId: 'belial',
          participantIds: ['belial'], pendingRequestIds: [], status: 'scheduled',
        }),
      ])
    })
    const belialDb = environment.authenticatedContext('belial').firestore()
    const redonDb = environment.authenticatedContext('redon').firestore()
    const belialSessions = createFirestoreGameSessionRepository(belialDb)
    const redonSessions = createFirestoreGameSessionRepository(redonDb)
    const legacy = await belialSessions.getById('legacy-name-only')
    assert.equal(legacy?.game, 'Root')
    assert.equal(legacy?.gameId, undefined)

    redonFeed = collectFeed(redonSessions, createFirestoreParticipationRequestRepository(redonDb), 'redon')
    await redonFeed.waitFor((state) => !state.loading && !state.error, 'initial legacy feed')
    const created = await belialSessions.create({ ...input('Azul'), gameId: 'azul' }, 'belial')
    assert.equal(created.gameId, 'azul')
    await redonFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.gameId === 'azul', 'cataloged realtime session')
    const createdDocument = await getDoc(doc(belialDb, 'gameSessions', created.id))
    assert.equal(createdDocument.data()?.gameName, 'Azul')
    assert.equal(createdDocument.data()?.gameId, 'azul')

    await belialSessions.update(created.id, { ...input('Azul'), place: 'Sala nueva' }, 'belial')
    assert.equal((await belialSessions.getById(created.id))?.gameId, 'azul', 'old select retains identity when the name is unchanged')
    await belialSessions.update(created.id, input('Wingspan'), 'belial')
    assert.equal((await belialSessions.getById(created.id))?.gameId, undefined, 'changing the name without an ID unlinks it')
    assert.equal((await getDoc(doc(belialDb, 'gameSessions', created.id))).data()?.gameId, undefined)

    await belialSessions.update('legacy-name-only', { ...input('Root'), gameId: 'root' }, 'belial')
    assert.equal((await redonSessions.getById('legacy-name-only'))?.gameId, 'root')
    assert.equal((await getDoc(doc(belialDb, 'gameSessions', 'legacy-name-only'))).data()?.gameName, 'Root')
    assert.deepEqual((await belialSessions.discover()).map((item) => item.id).sort(), [created.id, 'legacy-name-only'].sort())
    await assert.rejects(belialSessions.create({ ...input('Azul'), gameId: 'Azul' }, 'belial'), /INVALID_GAME_SELECTION/)
  } finally {
    redonFeed?.feed.stop()
    await environment.cleanup()
  }
})

test('a denied realtime listener reports an application error', async () => {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port },
  })
  try {
    await environment.clearFirestore()
    const repository = createFirestoreGameSessionRepository(environment.authenticatedContext('unauthorized').firestore())
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('No listener permission error arrived')), 10000)
      const unsubscribe = repository.observeAll({
        next: () => {
          clearTimeout(timeout)
          unsubscribe()
          reject(new Error('Unauthorized listener delivered data'))
        },
        error: (reason) => {
          clearTimeout(timeout)
          assert.equal(reason, 'permission-denied')
          unsubscribe()
          resolve()
        },
      })
    })
  } finally {
    await environment.cleanup()
  }
})
