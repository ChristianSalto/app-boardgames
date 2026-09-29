import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  acceptParticipationRequest,
  rejectParticipationRequest,
  requestParticipation,
  type ParticipationRequestRepository,
} from '../game-sessions/application/participationRequestRepository'
import { observeSessionFeed, type SessionFeed } from '../game-sessions/application/observeSessionFeed.ts'
import type { CreateSessionInput, GameSession, UpdateSessionInput } from '../game-sessions/types'
import { initialPlayers } from '../mock-data/prototypeData'
import {
  cancelGameSession,
  createGameSession as persistGameSession,
  type GameSessionRepository,
  updateGameSession as persistGameSessionUpdate,
} from '../game-sessions/application/gameSessionRepository'
import type { Player } from '../players/types'
import { getPlayerById, type PlayerRepository } from '../players/application/playerRepository'

type PrototypeContextValue = {
  readonly currentPlayerId: string
  readonly players: readonly Player[]
  readonly playerLoadStates: Readonly<Record<string, 'loading' | 'missing' | 'error'>>
  readonly sessions: readonly GameSession[]
  readonly requestSeat: (sessionId: string) => Promise<void>
  readonly acceptRequest: (sessionId: string, playerId: string) => Promise<void>
  readonly declineRequest: (sessionId: string, playerId: string) => Promise<void>
  readonly createSession: (input: CreateSessionInput) => Promise<string>
  readonly updateSession: (id: string, input: UpdateSessionInput) => Promise<void>
  readonly cancelSession: (id: string) => Promise<void>
  readonly getPlayer: (id: string) => Promise<Player | null>
  readonly sessionsLoading: boolean
  readonly sessionsError: boolean
  readonly retrySessions: () => Promise<void>
}

const PrototypeContext = createContext<PrototypeContextValue | undefined>(undefined)

export function PrototypeProvider({
  children,
  currentPlayer,
  sessionRepository,
  participationRequestRepository,
  playerRepository,
}: {
  readonly children: ReactNode
  readonly currentPlayer: Player
  readonly sessionRepository: GameSessionRepository
  readonly participationRequestRepository: ParticipationRequestRepository
  readonly playerRepository: PlayerRepository
}) {
  const currentPlayerId = currentPlayer.id
  const [players, setPlayers] = useState<readonly Player[]>(() => upsertPlayer(initialPlayers, currentPlayer))
  const [playerLoadStates, setPlayerLoadStates] = useState<Readonly<Record<string, 'loading' | 'missing' | 'error'>>>({})
  const [sessions, setSessions] = useState<readonly GameSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState(false)
  const feedRef = useRef<SessionFeed | null>(null)

  useEffect(() => {
    setPlayers((current) => upsertPlayer(current, currentPlayer))
  }, [currentPlayer])

  useEffect(() => {
    let active = true
    let latestDelivery = 0
    const playerLookups = new Map<string, Promise<Player | null>>()
    const loadPlayer = (id: string) => {
      const existing = playerLookups.get(id)
      if (existing) return existing
      setPlayerLoadStates((current) => ({ ...current, [id]: 'loading' }))
      const lookup = getPlayerById(playerRepository, id)
        .then((player) => {
          if (active) setPlayerLoadStates((current) => {
            const next = { ...current }
            if (player) delete next[id]
            else next[id] = 'missing'
            return next
          })
          if (!player) playerLookups.delete(id)
          return player
        })
        .catch((error: unknown) => {
          if (active) setPlayerLoadStates((current) => ({ ...current, [id]: 'error' }))
          playerLookups.delete(id)
          throw error
        })
      playerLookups.set(id, lookup)
      return lookup
    }
    const feed = observeSessionFeed(
      sessionRepository,
      participationRequestRepository,
      currentPlayerId,
      (state) => {
        const delivery = ++latestDelivery
        if (state.error) {
          setSessionsError(true)
          setSessionsLoading(false)
          return
        }
        if (state.loading) {
          setSessionsError(false)
          setSessionsLoading(true)
          return
        }

        setSessions(state.sessions)
        setSessionsError(false)
        setSessionsLoading(false)

        const playerIds = [...new Set(state.sessions.flatMap((session) => [
          ...session.participantIds,
          ...session.requests.map((request) => request.playerId),
        ]))].filter((id) => id !== currentPlayerId)
        playerIds.forEach((id) => {
          void loadPlayer(id)
            .then((player) => {
              if (!active || delivery !== latestDelivery || !player) return
              setPlayers((current) => upsertPlayer(current, player))
            })
            .catch(() => {})
        })
      },
    )
    feedRef.current = feed
    return () => {
      active = false
      latestDelivery += 1
      feed.stop()
      if (feedRef.current === feed) feedRef.current = null
    }
  }, [currentPlayer, currentPlayerId, participationRequestRepository, playerRepository, sessionRepository])

  const retrySessions = useCallback(async () => {
    feedRef.current?.retry()
  }, [])

  const requestSeat = useCallback(async (sessionId: string) => {
    await requestParticipation(participationRequestRepository, sessionId, currentPlayerId)
  }, [currentPlayerId, participationRequestRepository])

  const acceptRequest = useCallback(async (sessionId: string, playerId: string) => {
    await acceptParticipationRequest(participationRequestRepository, sessionId, playerId, currentPlayerId)
  }, [currentPlayerId, participationRequestRepository])

  const declineRequest = useCallback(async (sessionId: string, playerId: string) => {
    await rejectParticipationRequest(participationRequestRepository, sessionId, playerId, currentPlayerId)
  }, [currentPlayerId, participationRequestRepository])

  const createSession = useCallback(async (input: CreateSessionInput) => {
    const session = await persistGameSession(sessionRepository, input, currentPlayerId)
    feedRef.current?.includeCommittedSession(session)
    return session.id
  }, [currentPlayerId, sessionRepository])

  const updateSession = useCallback(async (id: string, input: UpdateSessionInput) => {
    await persistGameSessionUpdate(sessionRepository, id, input, currentPlayerId)
  }, [currentPlayerId, sessionRepository])

  const cancelSession = useCallback(async (id: string) => {
    await cancelGameSession(sessionRepository, id, currentPlayerId)
  }, [currentPlayerId, sessionRepository])

  const getPlayer = useCallback(async (id: string) => {
    const player = await getPlayerById(playerRepository, id)
    if (player) setPlayers((current) => upsertPlayer(current, player))
    return player
  }, [playerRepository])

  const value = useMemo<PrototypeContextValue>(
    () => ({
      currentPlayerId,
      players,
      playerLoadStates,
      sessions,
      requestSeat,
      acceptRequest,
      declineRequest,
      createSession,
      updateSession,
      cancelSession,
      getPlayer,
      sessionsLoading,
      sessionsError,
      retrySessions,
    }),
    [
      players,
      playerLoadStates,
      sessions,
      requestSeat,
      acceptRequest,
      declineRequest,
      createSession,
      updateSession,
      cancelSession,
      getPlayer,
      sessionsLoading,
      sessionsError,
      retrySessions,
    ],
  )

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  )
}

const upsertPlayer = (players: readonly Player[], player: Player): readonly Player[] => {
  const hasPlayer = players.some((item) => item.id === player.id)
  return hasPlayer
    ? players.map((item) => (item.id === player.id ? player : item))
    : [...players, player]
}

export const usePrototype = () => {
  const context = useContext(PrototypeContext)
  if (!context) {
    throw new Error('usePrototype must be used inside PrototypeProvider')
  }
  return context
}
