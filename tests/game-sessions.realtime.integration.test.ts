import assert from 'node:assert/strict'
import test from 'node:test'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc } from 'firebase/firestore'
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
  const waiters = new Set<() => void>()
  const feed = observeSessionFeed(sessionRepository, requestRepository, playerId, (state) => {
    latest = state
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
  return { feed, waitFor }
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
    belialFeed.feed.includeCommittedSession(created)
    await Promise.all([
      belialFeed.waitFor((state) => !state.loading && state.sessions.some((item) => item.id === created.id), 'Belial creation'),
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
    await redonFeed.waitFor((state) => {
      const item = state.sessions.find((session) => session.id === created.id)
      return Boolean(item?.participantIds.includes('redon')
        && item.requests.some((request) => request.playerId === 'redon' && request.status === 'confirmed'))
    }, 'Redon confirmed status')

    const rejectedSession = await belialSessions.create(input('Wingspan'), 'belial')
    await redonFeed.waitFor((state) => state.sessions.some((item) => item.id === rejectedSession.id), 'second session discovery')
    await redonRequests.requestParticipation(rejectedSession.id, 'redon')
    await belialFeed.waitFor((state) => state.sessions.find((item) => item.id === rejectedSession.id)?.requests.some(
      (item) => item.playerId === 'redon' && item.status === 'pending',
    ) ?? false, 'second pending request')
    await belialRequests.rejectParticipationRequest(rejectedSession.id, 'redon', 'belial')
    await redonFeed.waitFor((state) => state.sessions.find((item) => item.id === rejectedSession.id)?.requests.some(
      (item) => item.playerId === 'redon' && item.status === 'rejected',
    ) ?? false, 'Redon rejected status')

    await belialSessions.update(created.id, { ...input('Azul', '17:30'), place: 'Sala nueva' }, 'belial')
    await redonFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.place === 'Sala nueva', 'remote edit')
    await belialSessions.cancel(created.id, 'belial')
    const cancelled = await redonFeed.waitFor((state) => state.sessions.find((item) => item.id === created.id)?.lifecycle === 'cancelled', 'remote cancellation')
    assert.equal(cancelled.sessions.find((item) => item.id === created.id)?.place, 'Sala nueva')
  } finally {
    belialFeed?.feed.stop()
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
