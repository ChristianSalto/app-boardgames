import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  acceptParticipation,
  createGameSession,
  declineParticipation,
  requestParticipation,
} from '../game-sessions/model'
import type { CreateSessionInput, GameSession } from '../game-sessions/types'
import {
  createInitialSessions,
  initialPlayers,
  prototypeTones,
} from '../mock-data/prototypeData'
import type { Player, PlayerProfileInput } from '../players/types'

type PrototypeContextValue = {
  readonly currentPlayerId: string
  readonly players: readonly Player[]
  readonly sessions: readonly GameSession[]
  readonly requestSeat: (sessionId: string) => void
  readonly acceptRequest: (sessionId: string, playerId: string) => void
  readonly declineRequest: (sessionId: string, playerId: string) => void
  readonly createSession: (input: CreateSessionInput) => string
  readonly updateCurrentPlayer: (input: PlayerProfileInput) => void
}

const PrototypeContext = createContext<PrototypeContextValue | undefined>(undefined)

export function PrototypeProvider({
  children,
  currentPlayerId,
}: {
  readonly children: ReactNode
  readonly currentPlayerId: string
}) {
  const [players, setPlayers] = useState<readonly Player[]>(initialPlayers)
  const [sessions, setSessions] =
    useState<readonly GameSession[]>(createInitialSessions)

  const requestSeat = useCallback((sessionId: string) => {
    setSessions((current) =>
      current.map((item) =>
        item.id === sessionId
          ? requestParticipation(item, currentPlayerId)
          : item,
      ),
    )
  }, [currentPlayerId])

  const acceptRequest = useCallback((sessionId: string, playerId: string) => {
    setSessions((current) =>
      current.map((item) =>
        item.id === sessionId ? acceptParticipation(item, playerId) : item,
      ),
    )
  }, [])

  const declineRequest = useCallback((sessionId: string, playerId: string) => {
    setSessions((current) =>
      current.map((item) =>
        item.id === sessionId ? declineParticipation(item, playerId) : item,
      ),
    )
  }, [])

  const createSession = useCallback((input: CreateSessionInput) => {
    const id = `session-${Date.now()}`
    const toneIndex = Math.abs(input.game.length + input.zone.length) % prototypeTones.length
    const tone = prototypeTones[toneIndex] ?? 'forest'
    const newSession: GameSession = createGameSession(
      input,
      currentPlayerId,
      id,
      tone,
    )

    setSessions((current) => [...current, newSession])
    return id
  }, [currentPlayerId])

  const updateCurrentPlayer = useCallback((input: PlayerProfileInput) => {
    setPlayers((current) =>
      current.map((player) =>
        player.id === currentPlayerId
          ? {
              ...player,
              name: input.name.trim(),
              zone: input.zone,
              description: input.description.trim(),
            }
          : player,
      ),
    )
  }, [currentPlayerId])

  const value = useMemo<PrototypeContextValue>(
    () => ({
      currentPlayerId,
      players,
      sessions,
      requestSeat,
      acceptRequest,
      declineRequest,
      createSession,
      updateCurrentPlayer,
    }),
    [
      players,
      sessions,
      requestSeat,
      acceptRequest,
      declineRequest,
      createSession,
      updateCurrentPlayer,
    ],
  )

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  )
}

export const usePrototype = () => {
  const context = useContext(PrototypeContext)
  if (!context) {
    throw new Error('usePrototype must be used inside PrototypeProvider')
  }
  return context
}
