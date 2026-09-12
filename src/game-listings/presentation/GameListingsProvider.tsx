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
  closeGameListing,
  createGameListing,
  discoverGameListings,
  getGameListing,
  getMyGameListings,
  type GameListingCommandDependencies,
  updateGameListing,
} from '../application/gameListings'
import type { GameListingRepository } from '../application/gameListingRepository'
import {
  expressListingInterest,
  getMyListingInterest,
} from '../application/listingInterests'
import type { ListingInterestRepository } from '../application/listingInterestRepository'
import type {
  GameListing,
  GameListingId,
  GameListingInput,
  ListingResult,
  PlayerId,
} from '../domain/gameListing'
import type { ListingInterest, ListingInterestResult } from '../domain/listingInterest'

type GameListingsContextValue = Readonly<{
  activeListings: readonly GameListing[]
  ownListings: readonly GameListing[]
  loading: boolean
  createListing: (input: GameListingInput) => Promise<ListingResult<GameListing>>
  updateListing: (id: GameListingId, input: GameListingInput) => Promise<ListingResult<GameListing>>
  closeListing: (id: GameListingId) => Promise<ListingResult<GameListing>>
  getListing: (id: GameListingId) => Promise<GameListing | null>
  getInterest: (id: GameListingId) => Promise<ListingInterest | null>
  expressInterest: (id: GameListingId) => Promise<ListingInterestResult>
}>

const GameListingsContext = createContext<GameListingsContextValue | undefined>(undefined)

export function GameListingsProvider({
  children,
  commandDependencies,
  currentPlayerId,
  gameListingRepository,
  listingInterestRepository,
}: {
  readonly children: ReactNode
  readonly commandDependencies: GameListingCommandDependencies
  readonly currentPlayerId: PlayerId
  readonly gameListingRepository: GameListingRepository
  readonly listingInterestRepository: ListingInterestRepository
}) {
  const [activeListings, setActiveListings] = useState<readonly GameListing[]>([])
  const [ownListings, setOwnListings] = useState<readonly GameListing[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [active, own] = await Promise.all([
      discoverGameListings(gameListingRepository, 'Madrid'),
      getMyGameListings(gameListingRepository, currentPlayerId),
    ])
    setActiveListings(active)
    setOwnListings(own)
  }, [currentPlayerId, gameListingRepository])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    refresh()
      .catch(() => {
        if (mounted) {
          setActiveListings([])
          setOwnListings([])
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [refresh])

  const createListing = useCallback(async (input: GameListingInput) => {
    const result = await createGameListing(
      gameListingRepository,
      input,
      currentPlayerId,
      commandDependencies,
    )
    if (result.ok) await refresh()
    return result
  }, [commandDependencies, currentPlayerId, gameListingRepository, refresh])

  const updateListing = useCallback(async (id: GameListingId, input: GameListingInput) => {
    const result = await updateGameListing(gameListingRepository, id, input, currentPlayerId)
    if (result.ok) await refresh()
    return result
  }, [currentPlayerId, gameListingRepository, refresh])

  const closeListing = useCallback(async (id: GameListingId) => {
    const result = await closeGameListing(gameListingRepository, id, currentPlayerId)
    if (result.ok) await refresh()
    return result
  }, [currentPlayerId, gameListingRepository, refresh])

  const getListing = useCallback(
    (id: GameListingId) => getGameListing(gameListingRepository, id),
    [gameListingRepository],
  )

  const getInterest = useCallback(
    (id: GameListingId) => getMyListingInterest(listingInterestRepository, id, currentPlayerId),
    [currentPlayerId, listingInterestRepository],
  )

  const expressInterest = useCallback(
    (id: GameListingId) => expressListingInterest(
      gameListingRepository,
      listingInterestRepository,
      id,
      currentPlayerId,
      commandDependencies.now,
    ),
    [commandDependencies.now, currentPlayerId, gameListingRepository, listingInterestRepository],
  )

  const value = useMemo<GameListingsContextValue>(() => ({
    activeListings,
    ownListings,
    loading,
    createListing,
    updateListing,
    closeListing,
    getListing,
    getInterest,
    expressInterest,
  }), [
    activeListings,
    closeListing,
    createListing,
    expressInterest,
    getInterest,
    getListing,
    loading,
    ownListings,
    updateListing,
  ])

  return <GameListingsContext.Provider value={value}>{children}</GameListingsContext.Provider>
}

export const useGameListings = () => {
  const context = useContext(GameListingsContext)
  if (!context) throw new Error('useGameListings must be used inside GameListingsProvider')
  return context
}
