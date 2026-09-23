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
  createGameListingWithImage,
  discoverGameListings,
  getGameListing,
  getMyGameListings,
  type GameListingCommandResult,
  type GameListingCommandDependencies,
  updateGameListingWithOptionalImage,
} from '../application/gameListings'
import type { GameListingRepository } from '../application/gameListingRepository'
import type { ListingImageRepository, ListingImageUpload } from '../application/listingImageRepository'
import {
  acceptListingInterest,
  declineListingInterest,
  expressListingInterest,
  getListingInterestsForOwner,
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
import type { ListingInterest, ListingInterestResolutionResult, ListingInterestResult } from '../domain/listingInterest'

type GameListingsContextValue = Readonly<{
  activeListings: readonly GameListing[]
  ownListings: readonly GameListing[]
  loading: boolean
  loadError: boolean
  createListing: (input: Omit<GameListingInput, 'imageUrl'>, image: ListingImageUpload) => Promise<GameListingCommandResult<GameListing>>
  updateListing: (id: GameListingId, input: Omit<GameListingInput, 'imageUrl'>, image?: ListingImageUpload) => Promise<GameListingCommandResult<GameListing>>
  closeListing: (id: GameListingId) => Promise<ListingResult<GameListing>>
  getListing: (id: GameListingId) => Promise<GameListing | null>
  getInterest: (id: GameListingId) => Promise<ListingInterest | null>
  getOwnerInterests: (id: GameListingId) => Promise<readonly ListingInterest[]>
  expressInterest: (id: GameListingId) => Promise<ListingInterestResult>
  acceptInterest: (listingId: GameListingId, playerId: PlayerId) => Promise<ListingInterestResolutionResult>
  declineInterest: (listingId: GameListingId, playerId: PlayerId) => Promise<ListingInterestResolutionResult>
}>

const GameListingsContext = createContext<GameListingsContextValue | undefined>(undefined)

export function GameListingsProvider({
  children,
  commandDependencies,
  currentPlayerId,
  gameListingRepository,
  listingInterestRepository,
  listingImageRepository,
}: {
  readonly children: ReactNode
  readonly commandDependencies: GameListingCommandDependencies
  readonly currentPlayerId: PlayerId
  readonly gameListingRepository: GameListingRepository
  readonly listingInterestRepository: ListingInterestRepository
  readonly listingImageRepository: ListingImageRepository
}) {
  const [activeListings, setActiveListings] = useState<readonly GameListing[]>([])
  const [ownListings, setOwnListings] = useState<readonly GameListing[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const refresh = useCallback(async () => {
    const [active, own] = await Promise.all([
      discoverGameListings(gameListingRepository, 'Madrid'),
      getMyGameListings(gameListingRepository, currentPlayerId),
    ])
    setActiveListings(active)
    setOwnListings(own)
    setLoadError(false)
  }, [currentPlayerId, gameListingRepository])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    refresh()
      .catch(() => {
        if (mounted) {
          setActiveListings([])
          setOwnListings([])
          setLoadError(true)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [refresh])

  const createListing = useCallback(async (input: Omit<GameListingInput, 'imageUrl'>, image: ListingImageUpload) => {
    const result = await createGameListingWithImage(
      gameListingRepository,
      listingImageRepository,
      input,
      image,
      currentPlayerId,
      commandDependencies,
    )
    if (result.ok) await refresh()
    return result
  }, [commandDependencies, currentPlayerId, gameListingRepository, listingImageRepository, refresh])

  const updateListing = useCallback(async (id: GameListingId, input: Omit<GameListingInput, 'imageUrl'>, image?: ListingImageUpload) => {
    const result = await updateGameListingWithOptionalImage(gameListingRepository, listingImageRepository, id, input, image, currentPlayerId)
    if (result.ok) await refresh()
    return result
  }, [currentPlayerId, gameListingRepository, listingImageRepository, refresh])

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

  const getOwnerInterests = useCallback(
    (id: GameListingId) => getListingInterestsForOwner(
      gameListingRepository,
      listingInterestRepository,
      id,
      currentPlayerId,
    ),
    [currentPlayerId, gameListingRepository, listingInterestRepository],
  )

  const acceptInterest = useCallback(
    (listingId: GameListingId, playerId: PlayerId) => acceptListingInterest(
      gameListingRepository,
      listingInterestRepository,
      listingId,
      playerId,
      currentPlayerId,
    ),
    [currentPlayerId, gameListingRepository, listingInterestRepository],
  )

  const declineInterest = useCallback(
    (listingId: GameListingId, playerId: PlayerId) => declineListingInterest(
      gameListingRepository,
      listingInterestRepository,
      listingId,
      playerId,
      currentPlayerId,
    ),
    [currentPlayerId, gameListingRepository, listingInterestRepository],
  )

  const value = useMemo<GameListingsContextValue>(() => ({
    activeListings,
    ownListings,
    loading,
    loadError,
    createListing,
    updateListing,
    closeListing,
    getListing,
    getInterest,
    getOwnerInterests,
    expressInterest,
    acceptInterest,
    declineInterest,
  }), [
    activeListings,
    closeListing,
    createListing,
    expressInterest,
    acceptInterest,
    declineInterest,
    getInterest,
    getOwnerInterests,
    getListing,
    loading,
    loadError,
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
