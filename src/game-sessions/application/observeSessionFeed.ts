import type { GameSession, ParticipationRequest } from '../types.ts'
import type { GameSessionRepository } from './gameSessionRepository.ts'
import type { ParticipationRequestRepository } from './participationRequestRepository.ts'
import type { SessionObservationError, Unsubscribe } from './sessionObservation.ts'

export type SessionFeedState = Readonly<{
  sessions: readonly GameSession[]
  loading: boolean
  error: SessionObservationError | null
}>

export type SessionFeed = Readonly<{
  retry: () => void
  stop: () => void
  includeCommittedSession: (session: GameSession) => void
}>

const mergeRequests = (...lists: readonly (readonly ParticipationRequest[])[]) => {
  const byId = new Map<string, ParticipationRequest>()
  lists.flat().forEach((request) => byId.set(request.id, request))
  return [...byId.values()]
}

export const observeSessionFeed = (
  sessionRepository: GameSessionRepository,
  requestRepository: ParticipationRequestRepository,
  playerId: string,
  onState: (state: SessionFeedState) => void,
): SessionFeed => {
  let generation = 0
  let stopped = false
  let failed = false
  let hasReadyState = false
  let sessionSource: readonly GameSession[] | null = null
  let ownRequests: readonly ParticipationRequest[] | null = null
  let lastSessions: readonly GameSession[] = []
  const committedSessions = new Map<string, GameSession>()
  const organizerRequests = new Map<string, readonly ParticipationRequest[] | null>()
  const organizerUnsubscribes = new Map<string, Unsubscribe>()
  const organizerMarkers = new Map<string, symbol>()
  let rootUnsubscribes: Unsubscribe[] = []

  const detach = () => {
    rootUnsubscribes.forEach((unsubscribe) => unsubscribe())
    rootUnsubscribes = []
    organizerUnsubscribes.forEach((unsubscribe) => unsubscribe())
    organizerUnsubscribes.clear()
    organizerMarkers.clear()
    organizerRequests.clear()
  }

  const publish = () => {
    if (stopped || failed) return
    if (sessionSource === null || ownRequests === null
      || [...organizerRequests.values()].some((requests) => requests === null)) {
      onState({ sessions: lastSessions, loading: !hasReadyState, error: null })
      return
    }

    const allSessions = [...sessionSource]
    committedSessions.forEach((session, id) => {
      if (!allSessions.some((item) => item.id === id)) allSessions.push(session)
    })
    const requests = mergeRequests(ownRequests, ...[...organizerRequests.values()].filter(
      (items): items is readonly ParticipationRequest[] => items !== null,
    ))
    lastSessions = allSessions.map((session) => ({
      ...session,
      requests: requests.filter((request) => request.sessionId === session.id),
    }))
    hasReadyState = true
    onState({ sessions: lastSessions, loading: false, error: null })
  }

  const fail = (sourceGeneration: number, error: SessionObservationError) => {
    if (stopped || failed || sourceGeneration !== generation) return
    failed = true
    detach()
    onState({ sessions: lastSessions, loading: false, error })
  }

  const start = () => {
    generation += 1
    const sourceGeneration = generation
    detach()
    failed = false
    hasReadyState = false
    sessionSource = null
    ownRequests = null
    onState({ sessions: lastSessions, loading: true, error: null })

    const active = () => !stopped && !failed && sourceGeneration === generation

    const reconcileOrganizers = (sessions: readonly GameSession[]) => {
      const desired = new Set(sessions.filter((session) => session.organizerId === playerId).map((session) => session.id))
      organizerUnsubscribes.forEach((unsubscribe, id) => {
        if (desired.has(id)) return
        unsubscribe()
        organizerUnsubscribes.delete(id)
        organizerMarkers.delete(id)
        organizerRequests.delete(id)
      })
      desired.forEach((id) => {
        if (organizerMarkers.has(id)) return
        const marker = Symbol(id)
        organizerMarkers.set(id, marker)
        organizerRequests.set(id, null)
        const isCurrent = () => active() && organizerMarkers.get(id) === marker
        try {
          const unsubscribe = requestRepository.observePendingForSession(id, {
            next: (requests) => {
              if (!isCurrent()) return
              organizerRequests.set(id, requests)
              publish()
            },
            error: (reason) => {
              if (isCurrent()) fail(sourceGeneration, reason)
            },
          })
          if (isCurrent()) organizerUnsubscribes.set(id, unsubscribe)
          else unsubscribe()
        } catch {
          fail(sourceGeneration, 'unexpected')
        }
      })
    }

    try {
      const unsubscribeSessions = sessionRepository.observeAll({
        next: (sessions) => {
          if (!active()) return
          sessionSource = sessions
          sessions.forEach((session) => committedSessions.delete(session.id))
          reconcileOrganizers(sessions)
          publish()
        },
        error: (reason) => fail(sourceGeneration, reason),
      })
      if (active()) rootUnsubscribes.push(unsubscribeSessions)
      else unsubscribeSessions()

      if (!active()) return
      const unsubscribeOwnRequests = requestRepository.observeForPlayer(playerId, {
        next: (requests) => {
          if (!active()) return
          ownRequests = requests
          publish()
        },
        error: (reason) => fail(sourceGeneration, reason),
      })
      if (active()) rootUnsubscribes.push(unsubscribeOwnRequests)
      else unsubscribeOwnRequests()
    } catch {
      fail(sourceGeneration, 'unexpected')
    }
  }

  start()

  return {
    retry: () => { if (!stopped) start() },
    stop: () => {
      if (stopped) return
      stopped = true
      generation += 1
      detach()
    },
    includeCommittedSession: (session) => {
      if (stopped) return
      if (!sessionSource?.some((item) => item.id === session.id)) {
        committedSessions.set(session.id, session)
      }
      lastSessions = lastSessions.some((item) => item.id === session.id)
        ? lastSessions.map((item) => item.id === session.id ? session : item)
        : [...lastSessions, session]
      publish()
    },
  }
}
