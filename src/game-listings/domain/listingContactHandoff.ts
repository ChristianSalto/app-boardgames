import type { GameListingId, PlayerId } from './gameListing.ts'

export type ListingContactMethod = 'email' | 'phone' | 'other'

export type ListingContactHandoff = Readonly<{
  listingId: GameListingId
  interestedPlayerId: PlayerId
  sharedByOwnerId: PlayerId
  method: ListingContactMethod
  value: string
  createdAt: string
}>
