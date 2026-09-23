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

export type ListingInterestResolutionError =
  | 'listing-not-found'
  | 'interest-not-found'
  | 'not-listing-owner'
  | 'interest-not-pending'

export type ListingInterestResolutionResult =
  | Readonly<{ ok: true; value: ListingInterest }>
  | Readonly<{ ok: false; error: ListingInterestResolutionError }>

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

export const resolveListingInterest = (
  listing: GameListing | null,
  interest: ListingInterest | null,
  ownerId: PlayerId,
  status: Extract<ListingInterestStatus, 'accepted' | 'declined'>,
): ListingInterestResolutionResult => {
  if (!listing) return { ok: false, error: 'listing-not-found' }
  if (!interest) return { ok: false, error: 'interest-not-found' }
  if (listing.ownerId !== ownerId) return { ok: false, error: 'not-listing-owner' }
  if (interest.status !== 'pending') return { ok: false, error: 'interest-not-pending' }

  return { ok: true, value: { ...interest, status } }
}
