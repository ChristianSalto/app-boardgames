import type { GameListingId, PlayerId } from '../domain/gameListing.ts'
import type { ListingInterest } from '../domain/listingInterest.ts'

export type ListingInterestRepository = Readonly<{
  createPending: (interest: ListingInterest) => Promise<ListingInterest>
  getByListingAndPlayer: (
    listingId: GameListingId,
    playerId: PlayerId,
  ) => Promise<ListingInterest | null>
}>
