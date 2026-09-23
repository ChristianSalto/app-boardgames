import {
  expressListingInterest as expressListingInterestInDomain,
  resolveListingInterest as resolveListingInterestInDomain,
  type ListingInterestResolutionResult,
  type ListingInterestResult,
} from '../domain/listingInterest.ts'
import type { GameListingId, PlayerId } from '../domain/gameListing.ts'
import type { GameListingRepository } from './gameListingRepository.ts'
import type { ListingInterestRepository } from './listingInterestRepository.ts'

export const getMyListingInterest = (
  repository: ListingInterestRepository,
  listingId: GameListingId,
  playerId: PlayerId,
) => repository.getByListingAndPlayer(listingId, playerId)

export const expressListingInterest = async (
  gameListingRepository: GameListingRepository,
  listingInterestRepository: ListingInterestRepository,
  listingId: GameListingId,
  playerId: PlayerId,
  now: () => string,
): Promise<ListingInterestResult> => {
  const [listing, existingInterest] = await Promise.all([
    gameListingRepository.getById(listingId),
    listingInterestRepository.getByListingAndPlayer(listingId, playerId),
  ])
  const interest = expressListingInterestInDomain(
    listing,
    playerId,
    existingInterest,
    now(),
  )
  if (!interest.ok) return interest
  return { ok: true, value: await listingInterestRepository.createPending(interest.value) }
}

export const getListingInterestsForOwner = async (
  gameListingRepository: GameListingRepository,
  listingInterestRepository: ListingInterestRepository,
  listingId: GameListingId,
  ownerId: PlayerId,
) => {
  const listing = await gameListingRepository.getById(listingId)
  if (!listing || listing.ownerId !== ownerId) return []
  return listingInterestRepository.getForListing(listingId)
}

const resolveListingInterest = async (
  gameListingRepository: GameListingRepository,
  listingInterestRepository: ListingInterestRepository,
  listingId: GameListingId,
  playerId: PlayerId,
  ownerId: PlayerId,
  status: 'accepted' | 'declined',
): Promise<ListingInterestResolutionResult> => {
  const [listing, interest] = await Promise.all([
    gameListingRepository.getById(listingId),
    listingInterestRepository.getByListingAndPlayer(listingId, playerId),
  ])
  const resolved = resolveListingInterestInDomain(listing, interest, ownerId, status)
  if (!resolved.ok) return resolved
  return { ok: true, value: await listingInterestRepository.resolve(resolved.value) }
}

export const acceptListingInterest = (
  gameListingRepository: GameListingRepository,
  listingInterestRepository: ListingInterestRepository,
  listingId: GameListingId,
  playerId: PlayerId,
  ownerId: PlayerId,
) => resolveListingInterest(
  gameListingRepository,
  listingInterestRepository,
  listingId,
  playerId,
  ownerId,
  'accepted',
)

export const declineListingInterest = (
  gameListingRepository: GameListingRepository,
  listingInterestRepository: ListingInterestRepository,
  listingId: GameListingId,
  playerId: PlayerId,
  ownerId: PlayerId,
) => resolveListingInterest(
  gameListingRepository,
  listingInterestRepository,
  listingId,
  playerId,
  ownerId,
  'declined',
)
