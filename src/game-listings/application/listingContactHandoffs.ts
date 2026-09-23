import type { GameListingRepository } from './gameListingRepository.ts'
import type { ListingInterestRepository } from './listingInterestRepository.ts'
import type { ListingContactHandoff } from '../domain/listingContactHandoff.ts'

export const shareContactForAcceptedInterest = async (
  gameListingRepository: GameListingRepository,
  interestRepository: ListingInterestRepository,
  handoff: ListingContactHandoff,
) => {
  const [listing, interest] = await Promise.all([
    gameListingRepository.getById(handoff.listingId),
    interestRepository.getByListingAndPlayer(handoff.listingId, handoff.interestedPlayerId),
  ])
  if (!listing || listing.ownerId !== handoff.sharedByOwnerId || interest?.status !== 'accepted') return null
  return interestRepository.saveContactHandoff(handoff)
}

export const getAcceptedListingContact = (
  repository: ListingInterestRepository,
  listingId: string,
  playerId: string,
) => repository.getContactHandoff(listingId, playerId)
