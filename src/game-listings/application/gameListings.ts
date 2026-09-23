import {
  closeGameListing as closeGameListingInDomain,
  createGameListing as createGameListingInDomain,
  type GameListing,
  type GameListingId,
  type GameListingInput,
  type ListingError,
  type ListingResult,
  type PlayerId,
  updateGameListing as updateGameListingInDomain,
} from '../domain/gameListing.ts'
import type { GameListingRepository } from './gameListingRepository.ts'
import type { ListingImageRepository, ListingImageUpload } from './listingImageRepository.ts'
import { isListingOperationFailure, type ListingOperationFailureKind } from './listingOperationFailure.ts'

export type GameListingCommandDependencies = Readonly<{
  createId: () => GameListingId
  now: () => string
}>

export type GameListingCommandError = ListingError | ListingOperationFailureKind | 'unexpected-error'

export type GameListingCommandResult<Value> =
  | Readonly<{ ok: true; value: Value }>
  | Readonly<{ ok: false; error: GameListingCommandError }>

const asOperationError = (error: unknown): GameListingCommandError => (
  isListingOperationFailure(error) ? error.kind : 'unexpected-error'
)

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

export const createGameListingWithImage = async (
  repository: GameListingRepository,
  imageRepository: ListingImageRepository,
  input: Omit<GameListingInput, 'imageUrl'>,
  image: ListingImageUpload,
  ownerId: PlayerId,
  dependencies: GameListingCommandDependencies,
): Promise<GameListingCommandResult<GameListing>> => {
  const id = dependencies.createId()
  let imageUrl: string
  try {
    imageUrl = await imageRepository.uploadCover(ownerId, id, image)
  } catch (error) {
    return { ok: false, error: asOperationError(error) }
  }

  const listing = createGameListingInDomain({ ...input, imageUrl }, ownerId, id, dependencies.now())
  if (!listing.ok) {
    await imageRepository.deleteCover(ownerId, id).catch(() => undefined)
    return listing
  }

  try {
    return { ok: true, value: await repository.create(listing.value) }
  } catch (error) {
    await imageRepository.deleteCover(ownerId, id).catch(() => undefined)
    return { ok: false, error: asOperationError(error) }
  }
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

export const updateGameListingWithOptionalImage = async (
  repository: GameListingRepository,
  imageRepository: ListingImageRepository,
  id: GameListingId,
  input: Omit<GameListingInput, 'imageUrl'>,
  image: ListingImageUpload | undefined,
  actorId: PlayerId,
): Promise<GameListingCommandResult<GameListing>> => {
  const listing = await repository.getById(id)
  if (!listing) return { ok: false, error: 'listing-not-found' }
  const validated = updateGameListingInDomain(listing, { ...input, imageUrl: listing.imageUrl }, actorId)
  if (!validated.ok) return validated

  let imageUrl = listing.imageUrl
  if (image) {
    try {
      imageUrl = await imageRepository.uploadCover(actorId, id, image)
    } catch (error) {
      return { ok: false, error: asOperationError(error) }
    }
  }

  const updated = updateGameListingInDomain(validated.value, { ...input, imageUrl }, actorId)
  if (!updated.ok) return updated
  try {
    return { ok: true, value: await repository.updateActive(updated.value) }
  } catch (error) {
    return { ok: false, error: asOperationError(error) }
  }
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
