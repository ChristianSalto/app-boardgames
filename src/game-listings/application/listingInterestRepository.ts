import type { GameListingId, PlayerId } from '../domain/gameListing.ts'
import type { ListingContactHandoff } from '../domain/listingContactHandoff.ts'
import type { ListingInterest } from '../domain/listingInterest.ts'

export type ListingInterestRepository = Readonly<{
  createPending: (interest: ListingInterest) => Promise<ListingInterest>
  getByListingAndPlayer: (
    listingId: GameListingId,
    playerId: PlayerId,
  ) => Promise<ListingInterest | null>
  getForListing: (listingId: GameListingId) => Promise<readonly ListingInterest[]>
  resolve: (interest: ListingInterest) => Promise<ListingInterest>
  saveContactHandoff: (handoff: ListingContactHandoff) => Promise<ListingContactHandoff>
  getContactHandoff: (
    listingId: GameListingId,
    playerId: PlayerId,
  ) => Promise<ListingContactHandoff | null>
}>
