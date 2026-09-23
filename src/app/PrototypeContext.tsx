import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  acceptParticipationRequest,
  getParticipationForPlayer,
  getPendingRequestsForSession,
  rejectParticipationRequest,
  requestParticipation,
  type ParticipationRequestRepository,
} from '../game-sessions/application/participationRequestRepository'
import type { CreateSessionInput, GameSession, ParticipationRequest, UpdateSessionInput } from '../game-sessions/types'
import { initialPlayers } from '../mock-data/prototypeData'
import {
  cancelGameSession,
  createGameSession as persistGameSession,
  discoverGameSessions,
  type GameSessionRepository,
  updateGameSession as persistGameSessionUpdate,
} from '../game-sessions/application/gameSessionRepository'
import type { Player } from '../players/types'
import { getPlayerById, type PlayerRepository } from '../players/application/playerRepository'

type PrototypeContextValue = {
  readonly currentPlayerId: string
  readonly players: readonly Player[]
  readonly sessions: readonly GameSession[]
  readonly requestSeat: (sessionId: string) => Promise<void>
  readonly acceptRequest: (sessionId: string, playerId: string) => Promise<void>
  readonly declineRequest: (sessionId: string, playerId: string) => Promise<void>
  readonly createSession: (input: CreateSessionInput) => Promise<string>
  readonly updateSession: (id: string, input: UpdateSessionInput) => Promise<void>
  readonly cancelSession: (id: string) => Promise<void>
  readonly getPlayer: (id: string) => Promise<Player | null>
  readonly sessionsLoading: boolean
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
  const [sessions, setSessions] = useState<readonly GameSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  useEffect(() => {
    setPlayers((current) => upsertPlayer(current, currentPlayer))
  }, [currentPlayer])

  const refreshSessions = useCallback(async () => {
    const persistedSessions = await discoverGameSessions(sessionRepository)
    const ownRequests = await getParticipationForPlayer(participationRequestRepository, currentPlayerId)
    const organizedSessions = persistedSessions.filter((item) => item.organizerId === currentPlayerId)
    const organizerRequests = await Promise.all(
      organizedSessions.map((item) => getPendingRequestsForSession(participationRequestRepository, item.id)),
    )
    const requests = mergeRequests(ownRequests, organizerRequests.flat())
    const requestPlayerIds = requests
      .filter((item) => item.playerId !== currentPlayerId)
      .map((item) => item.playerId)
    const participantPlayerIds = persistedSessions
      .flatMap((item) => item.participantIds)
      .filter((id) => id !== currentPlayerId)
    const persistedPlayers = await Promise.all(
      [...new Set([...requestPlayerIds, ...participantPlayerIds])]
        .map((id) => getPlayerById(playerRepository, id)),
    )
    setPlayers((current) => mergePlayers(upsertPlayer(current, currentPlayer), persistedPlayers))
    setSessions(persistedSessions.map((session) => ({
      ...session,
      requests: requests.filter((request) => request.sessionId === session.id),
    })))
  }, [currentPlayer, currentPlayerId, participationRequestRepository, playerRepository, sessionRepository])

  useEffect(() => {
    let active = true
    setSessionsLoading(true)
    refreshSessions()
      .catch(() => undefined)
      .finally(() => { if (active) setSessionsLoading(false) })
    return () => { active = false }
  }, [refreshSessions])

  const requestSeat = useCallback(async (sessionId: string) => {
    await requestParticipation(participationRequestRepository, sessionId, currentPlayerId)
    await refreshSessions()
  }, [currentPlayerId, participationRequestRepository, refreshSessions])

  const acceptRequest = useCallback(async (sessionId: string, playerId: string) => {
    await acceptParticipationRequest(participationRequestRepository, sessionId, playerId, currentPlayerId)
    await refreshSessions()
  }, [currentPlayerId, participationRequestRepository, refreshSessions])

  const declineRequest = useCallback(async (sessionId: string, playerId: string) => {
    await rejectParticipationRequest(participationRequestRepository, sessionId, playerId, currentPlayerId)
    await refreshSessions()
  }, [currentPlayerId, participationRequestRepository, refreshSessions])

  const createSession = useCallback(async (input: CreateSessionInput) => {
    const session = await persistGameSession(sessionRepository, input, currentPlayerId)
    await refreshSessions()
    return session.id
  }, [currentPlayerId, refreshSessions, sessionRepository])

  const updateSession = useCallback(async (id: string, input: UpdateSessionInput) => {
    await persistGameSessionUpdate(sessionRepository, id, input, currentPlayerId)
    await refreshSessions()
  }, [currentPlayerId, refreshSessions, sessionRepository])

  const cancelSession = useCallback(async (id: string) => {
    await cancelGameSession(sessionRepository, id, currentPlayerId)
    await refreshSessions()
  }, [currentPlayerId, refreshSessions, sessionRepository])

  const getPlayer = useCallback(async (id: string) => {
    const player = await getPlayerById(playerRepository, id)
    if (player) setPlayers((current) => upsertPlayer(current, player))
    return player
  }, [playerRepository])

  const value = useMemo<PrototypeContextValue>(
    () => ({
      currentPlayerId,
      players,
      sessions,
      requestSeat,
      acceptRequest,
      declineRequest,
      createSession,
      updateSession,
      cancelSession,
      getPlayer,
      sessionsLoading,
    }),
    [
      players,
      sessions,
      requestSeat,
      acceptRequest,
      declineRequest,
      createSession,
      updateSession,
      cancelSession,
      getPlayer,
      sessionsLoading,
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

const mergeRequests = (...requestLists: readonly (readonly ParticipationRequest[])[]) => {
  const byId = new Map<string, ParticipationRequest>()
  requestLists.flat().forEach((request) => byId.set(request.id, request))
  return [...byId.values()]
}

const mergePlayers = (
  currentPlayers: readonly Player[],
  additionalPlayers: readonly (Player | null)[],
): readonly Player[] => additionalPlayers.reduce(
  (players, player) => player ? upsertPlayer(players, player) : players,
  currentPlayers,
)

export const usePrototype = () => {
  const context = useContext(PrototypeContext)
  if (!context) {
    throw new Error('usePrototype must be used inside PrototypeProvider')
  }
  return context
}
