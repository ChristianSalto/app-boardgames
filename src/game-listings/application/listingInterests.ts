import { expressListingInterest as expressListingInterestInDomain, type ListingInterestResult } from '../domain/listingInterest.ts'
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
