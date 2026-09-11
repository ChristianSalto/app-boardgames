import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuthentication } from '../../authentication/presentation/AuthenticationProvider'
import { createPlayer, getPlayerById, type PlayerRepository } from '../application/playerRepository'
import type { CreatePlayerInput, Player } from '../types'

type CurrentPlayerStatus = 'idle' | 'loading' | 'missing' | 'ready' | 'error'

type CurrentPlayerContextValue = Readonly<{
  status: CurrentPlayerStatus
  player: Player | null
  createCurrentPlayer: (input: Omit<CreatePlayerInput, 'id' | 'city'>) => Promise<boolean>
  retryCurrentPlayer: () => Promise<void>
}>

const CurrentPlayerContext = createContext<CurrentPlayerContextValue | undefined>(undefined)

export function CurrentPlayerProvider({
  children,
  repository,
}: {
  readonly children: ReactNode
  readonly repository: PlayerRepository
}) {
  const { status: authenticationStatus, user } = useAuthentication()
  const [status, setStatus] = useState<CurrentPlayerStatus>('idle')
  const [player, setPlayer] = useState<Player | null>(null)

  const loadCurrentPlayer = useCallback(async () => {
    if (authenticationStatus !== 'authenticated' || !user) {
      setPlayer(null)
      setStatus('idle')
      return
    }

    setStatus('loading')
    try {
      const nextPlayer = await getPlayerById(repository, user.id)
      setPlayer(nextPlayer)
      setStatus(nextPlayer ? 'ready' : 'missing')
    } catch {
      setPlayer(null)
      setStatus('error')
    }
  }, [authenticationStatus, repository, user])

  useEffect(() => {
    void loadCurrentPlayer()
  }, [loadCurrentPlayer])

  const createCurrentPlayer = useCallback(async (
    input: Omit<CreatePlayerInput, 'id' | 'city'>,
  ) => {
    if (!user) return false

    try {
      const nextPlayer = await createPlayer(repository, {
        id: user.id,
        city: 'Madrid',
        ...input,
      })
      setPlayer(nextPlayer)
      setStatus('ready')
      return true
    } catch {
      return false
    }
  }, [repository, user])

  const value = useMemo<CurrentPlayerContextValue>(() => ({
    status,
    player,
    createCurrentPlayer,
    retryCurrentPlayer: loadCurrentPlayer,
  }), [createCurrentPlayer, loadCurrentPlayer, player, status])

  return (
    <CurrentPlayerContext.Provider value={value}>
      {children}
    </CurrentPlayerContext.Provider>
  )
}

export const useCurrentPlayer = () => {
  const context = useContext(CurrentPlayerContext)
  if (!context) {
    throw new Error('useCurrentPlayer must be used inside CurrentPlayerProvider')
  }
  return context
}
