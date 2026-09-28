import assert from 'node:assert/strict'
import test from 'node:test'
import { observeSessionFeed, type SessionFeedState } from '../src/game-sessions/application/observeSessionFeed.ts'
import type { GameSessionRepository } from '../src/game-sessions/application/gameSessionRepository.ts'
import type { ParticipationRequestRepository } from '../src/game-sessions/application/participationRequestRepository.ts'
import type { SessionObserver } from '../src/game-sessions/application/sessionObservation.ts'
import type { GameSession, ParticipationRequest } from '../src/game-sessions/types.ts'

const session = (id: string, organizerId = 'belial'): GameSession => ({
  id,
  game: 'Azul',
  startsAt: '2031-06-20T14:00:00.000Z',
  city: 'Madrid',
  zone: 'Centro',
  place: '',
  description: '',
  capacity: 4,
  organizerId,
  participantIds: [organizerId],
  requests: [],
  lifecycle: 'scheduled',
  tone: 'forest',
})

const request = (sessionId: string, playerId: string, status: ParticipationRequest['status']): ParticipationRequest => ({
  id: `${sessionId}_${playerId}`,
  sessionId,
  playerId,
  status,
})

const fakeSources = () => {
  const sessions = new Set<SessionObserver<readonly GameSession[]>>()
  const own = new Map<string, Set<SessionObserver<readonly ParticipationRequest[]>>>()
  const organized = new Map<string, Set<SessionObserver<readonly ParticipationRequest[]>>>()
  const add = <T>(set: Set<SessionObserver<T>>, observer: SessionObserver<T>) => {
    set.add(observer)
    return () => { set.delete(observer) }
  }
  const forKey = <T>(map: Map<string, Set<SessionObserver<T>>>, key: string) => {
    if (!map.has(key)) map.set(key, new Set())
    return map.get(key)!
  }
  const gameSessions = {
    observeAll: (observer: SessionObserver<readonly GameSession[]>) => add(sessions, observer),
  } as GameSessionRepository
  const requests = {
    observeForPlayer: (id: string, observer: SessionObserver<readonly ParticipationRequest[]>) =>
      add(forKey(own, id), observer),
    observePendingForSession: (id: string, observer: SessionObserver<readonly ParticipationRequest[]>) =>
      add(forKey(organized, id), observer),
  } as ParticipationRequestRepository
  return {
    gameSessions,
    requests,
    emitSessions: (value: readonly GameSession[]) => sessions.forEach((observer) => observer.next(value)),
    emitOwn: (id: string, value: readonly ParticipationRequest[]) => own.get(id)?.forEach((observer) => observer.next(value)),
    emitOrganized: (id: string, value: readonly ParticipationRequest[]) => organized.get(id)?.forEach((observer) => observer.next(value)),
    failSessions: () => sessions.forEach((observer) => observer.error('unavailable')),
    firstSessionObserver: () => [...sessions][0],
    firstOrganizerObserver: (id: string) => [...(organized.get(id) ?? [])][0],
    counts: () => ({ sessions: sessions.size, own: [...own.values()].reduce((sum, set) => sum + set.size, 0), organized: [...organized.values()].reduce((sum, set) => sum + set.size, 0) }),
  }
}

test('first delivery waits for all sources; later request and session events update without refresh', () => {
  const sources = fakeSources()
  const states: SessionFeedState[] = []
  const feed = observeSessionFeed(sources.gameSessions, sources.requests, 'belial', (state) => states.push(state))
  assert.equal(states.at(-1)?.loading, true)
  sources.emitSessions([session('a')])
  sources.emitOwn('belial', [])
  assert.equal(states.at(-1)?.loading, true)
  sources.emitOrganized('a', [])
  assert.deepEqual(states.at(-1)?.sessions[0]?.requests, [])
  assert.equal(states.at(-1)?.loading, false)

  sources.emitOrganized('a', [request('a', 'redon', 'pending')])
  assert.equal(states.at(-1)?.sessions[0]?.requests[0]?.status, 'pending')
  sources.emitSessions([{ ...session('a'), participantIds: ['belial', 'redon'] }])
  assert.deepEqual(states.at(-1)?.sessions[0]?.participantIds, ['belial', 'redon'])
  sources.emitOrganized('a', [])
  assert.deepEqual(states.at(-1)?.sessions[0]?.requests, [])
  feed.stop()
})

test('request and session snapshots may arrive in either order', () => {
  const sources = fakeSources()
  const states: SessionFeedState[] = []
  const feed = observeSessionFeed(sources.gameSessions, sources.requests, 'redon', (state) => states.push(state))
  sources.emitOwn('redon', [request('a', 'redon', 'pending')])
  assert.equal(states.at(-1)?.loading, true)
  sources.emitSessions([session('a')])
  assert.equal(states.at(-1)?.sessions[0]?.requests[0]?.status, 'pending')
  sources.emitOwn('redon', [request('a', 'redon', 'confirmed')])
  assert.equal(states.at(-1)?.sessions[0]?.requests[0]?.status, 'confirmed')
  sources.emitSessions([{ ...session('a'), participantIds: ['belial', 'redon'] }])
  assert.deepEqual(states.at(-1)?.sessions[0]?.participantIds, ['belial', 'redon'])
  feed.stop()
})

test('organizer listeners are reconciled without duplicates and old callbacks are ignored', () => {
  const sources = fakeSources()
  const states: SessionFeedState[] = []
  const feed = observeSessionFeed(sources.gameSessions, sources.requests, 'belial', (state) => states.push(state))
  sources.emitSessions([session('a')])
  sources.emitOwn('belial', [])
  sources.emitOrganized('a', [])
  assert.deepEqual(sources.counts(), { sessions: 1, own: 1, organized: 1 })
  sources.emitSessions([session('a'), session('b')])
  assert.deepEqual(sources.counts(), { sessions: 1, own: 1, organized: 2 })
  assert.equal(states.at(-1)?.loading, false, 'An added organizer stream must not blank an already loaded page.')
  sources.emitSessions([session('a'), session('b')])
  assert.equal(sources.counts().organized, 2)
  sources.emitOrganized('b', [])
  const staleOrganizer = sources.firstOrganizerObserver('a')
  sources.emitSessions([session('b')])
  assert.equal(sources.counts().organized, 1)
  staleOrganizer?.next([request('a', 'redon', 'pending')])
  assert.equal(states.at(-1)?.sessions.length, 1)
  assert.equal(states.at(-1)?.sessions[0]?.id, 'b')
  feed.stop()
  assert.deepEqual(sources.counts(), { sessions: 0, own: 0, organized: 0 })
})

test('listener error, repeated retries and stop cancel every active listener', () => {
  const sources = fakeSources()
  const states: SessionFeedState[] = []
  const feed = observeSessionFeed(sources.gameSessions, sources.requests, 'belial', (state) => states.push(state))
  const stale = sources.firstSessionObserver()
  sources.emitSessions([session('a')])
  sources.emitOwn('belial', [])
  sources.emitOrganized('a', [])
  sources.failSessions()
  assert.equal(states.at(-1)?.error, 'unavailable')
  assert.deepEqual(sources.counts(), { sessions: 0, own: 0, organized: 0 })
  feed.retry()
  feed.retry()
  assert.deepEqual(sources.counts(), { sessions: 1, own: 1, organized: 0 })
  stale?.next([session('stale')])
  assert.equal(states.at(-1)?.loading, true)
  sources.emitSessions([session('a')])
  sources.emitOwn('belial', [])
  sources.emitOrganized('a', [])
  assert.equal(states.at(-1)?.error, null)
  assert.equal(states.at(-1)?.loading, false)
  feed.stop()
  sources.emitSessions([session('late')])
  assert.equal(states.at(-1)?.sessions[0]?.id, 'a')
  assert.deepEqual(sources.counts(), { sessions: 0, own: 0, organized: 0 })
})

test('changing users discards old listeners and committed creation stays visible until observed', () => {
  const sources = fakeSources()
  const oldStates: SessionFeedState[] = []
  const newStates: SessionFeedState[] = []
  const oldFeed = observeSessionFeed(sources.gameSessions, sources.requests, 'belial', (state) => oldStates.push(state))
  oldFeed.stop()
  const newFeed = observeSessionFeed(sources.gameSessions, sources.requests, 'redon', (state) => newStates.push(state))
  assert.deepEqual(sources.counts(), { sessions: 1, own: 1, organized: 0 })
  sources.emitSessions([])
  sources.emitOwn('redon', [])
  newFeed.includeCommittedSession(session('created', 'redon'))
  assert.equal(newStates.at(-1)?.loading, false)
  assert.equal(newStates.at(-1)?.sessions[0]?.id, 'created')
  sources.emitSessions([])
  assert.equal(newStates.at(-1)?.sessions[0]?.id, 'created')
  sources.emitSessions([session('created', 'redon')])
  sources.emitOrganized('created', [])
  assert.equal(newStates.at(-1)?.sessions[0]?.id, 'created')
  assert.equal(oldStates.at(-1)?.sessions.length, 0)
  newFeed.stop()
})
