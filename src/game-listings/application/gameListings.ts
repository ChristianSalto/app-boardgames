import {
  closeGameListing as closeGameListingInDomain,
  createGameListing as createGameListingInDomain,
  type GameListingId,
  type GameListingInput,
  type ListingError,
  type ListingResult,
  type PlayerId,
  updateGameListing as updateGameListingInDomain,
} from '../domain/gameListing.ts'
import type { GameListingRepository } from './gameListingRepository.ts'

export type GameListingCommandDependencies = Readonly<{
  createId: () => GameListingId
  now: () => string
}>

export const createGameListing = async (
  repository: GameListingRepository,
  input: GameListingInput,
  ownerId: PlayerId,
  dependencies: GameListingCommandDependencies,
): Promise<ListingResult<Awaited<ReturnType<GameListingRepository['create']>>>> => {
  const listing = createGameListingInDomain(input, ownerId, dependencies.createId(), dependencies.now())
  if (!listing.ok) return listing
  return { ok: true, value: await repository.create(listing.value) }
}

export const discoverGameListings = (
  repository: GameListingRepository,
  city: string,
  limit?: number,
) => repository.discoverActive({ city, limit })

export const getGameListing = (
  repository: GameListingRepository,
  id: GameListingId,
) => repository.getById(id)

export const getMyGameListings = (
  repository: GameListingRepository,
  ownerId: PlayerId,
) => repository.getByOwnerId(ownerId)

export const updateGameListing = async (
  repository: GameListingRepository,
  id: GameListingId,
  input: GameListingInput,
  actorId: PlayerId,
): Promise<ListingResult<Awaited<ReturnType<GameListingRepository['updateActive']>>>> => {
  const listing = await repository.getById(id)
  if (!listing) return { ok: false, error: 'listing-not-found' satisfies ListingError }

  const updated = updateGameListingInDomain(listing, input, actorId)
  if (!updated.ok) return updated
  return { ok: true, value: await repository.updateActive(updated.value) }
}

export const closeGameListing = async (
  repository: GameListingRepository,
  id: GameListingId,
  actorId: PlayerId,
): Promise<ListingResult<Awaited<ReturnType<GameListingRepository['close']>>>> => {
  const listing = await repository.getById(id)
  if (!listing) return { ok: false, error: 'listing-not-found' satisfies ListingError }

  const closed = closeGameListingInDomain(listing, actorId)
  if (!closed.ok) return closed
  return { ok: true, value: await repository.close(closed.value) }
}
