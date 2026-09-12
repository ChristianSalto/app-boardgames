import type { GameListing, GameListingId, PlayerId } from './gameListing.ts'

export type ListingInterestStatus = 'pending' | 'accepted' | 'declined'

export type ListingInterest = Readonly<{
  listingId: GameListingId
  playerId: PlayerId
  status: ListingInterestStatus
  createdAt: string
}>

export type ListingInterestError =
  | 'listing-not-found'
  | 'own-listing'
  | 'listing-closed'
  | 'interest-already-expressed'

export type ListingInterestResult =
  | Readonly<{ ok: true; value: ListingInterest }>
  | Readonly<{ ok: false; error: ListingInterestError }>

export const expressListingInterest = (
  listing: GameListing | null,
  playerId: PlayerId,
  existingInterest: ListingInterest | null,
  createdAt: string,
): ListingInterestResult => {
  if (!listing) return { ok: false, error: 'listing-not-found' }
  if (listing.ownerId === playerId) return { ok: false, error: 'own-listing' }
  if (listing.status !== 'active') return { ok: false, error: 'listing-closed' }
  if (existingInterest) return { ok: false, error: 'interest-already-expressed' }

  return {
    ok: true,
    value: {
      listingId: listing.id,
      playerId,
      status: 'pending',
      createdAt,
    },
  }
}
