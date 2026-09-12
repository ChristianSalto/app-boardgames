export type GameListingId = string
export type PlayerId = string

export const listingConditions = ['new', 'likeNew', 'good', 'used'] as const
export type ListingCondition = (typeof listingConditions)[number]

export const listingTypes = ['sale', 'trade'] as const
export type ListingType = (typeof listingTypes)[number]

export type ListingStatus = 'active' | 'closed'

export type Money = Readonly<{
  amountInCents: number
  currency: 'EUR'
}>

type ListingBase = Readonly<{
  id: GameListingId
  ownerId: PlayerId
  gameName: string
  imageUrl: string
  description: string
  condition: ListingCondition
  city: string
  district: string
  status: ListingStatus
  createdAt: string
}>

export type GameListing = ListingBase & (
  | Readonly<{ listingType: 'sale'; price: Money }>
  | Readonly<{ listingType: 'trade'; price?: never }>
)

export type GameListingInput = Readonly<{
  gameName: string
  imageUrl: string
  description: string
  condition: ListingCondition
  listingType: ListingType
  priceInCents?: number
  city: string
  district: string
}>

export type ListingError =
  | 'invalid-input'
  | 'listing-not-found'
  | 'not-owner'
  | 'listing-closed'

export type ListingResult<Value> =
  | Readonly<{ ok: true; value: Value }>
  | Readonly<{ ok: false; error: ListingError }>

const hasText = (value: string) => value.trim().length > 0

const isValidImageUrl = (value: string) => {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'data:'
  } catch {
    return false
  }
}

const isCondition = (value: ListingCondition) =>
  listingConditions.includes(value)

const isValidPrice = (priceInCents: number | undefined) =>
  Number.isInteger(priceInCents) && (priceInCents ?? 0) > 0

export const isActiveGameListing = (listing: GameListing) => listing.status === 'active'

const validateInput = (input: GameListingInput) =>
  hasText(input.gameName)
  && isValidImageUrl(input.imageUrl)
  && hasText(input.description)
  && hasText(input.city)
  && hasText(input.district)
  && isCondition(input.condition)
  && (
    input.listingType === 'sale'
      ? isValidPrice(input.priceInCents)
      : input.priceInCents === undefined
  )

const asListing = (
  input: GameListingInput,
  stable: Pick<ListingBase, 'id' | 'ownerId' | 'status' | 'createdAt'>,
): GameListing => {
  const base = {
    ...stable,
    gameName: input.gameName.trim(),
    imageUrl: input.imageUrl.trim(),
    description: input.description.trim(),
    condition: input.condition,
    city: input.city.trim(),
    district: input.district.trim(),
  }

  return input.listingType === 'sale'
    ? { ...base, listingType: 'sale', price: { amountInCents: input.priceInCents ?? 0, currency: 'EUR' } }
    : { ...base, listingType: 'trade' }
}

export const createGameListing = (
  input: GameListingInput,
  ownerId: PlayerId,
  id: GameListingId,
  createdAt: string,
): ListingResult<GameListing> => {
  if (!hasText(ownerId) || !hasText(id) || !hasText(createdAt) || !validateInput(input)) {
    return { ok: false, error: 'invalid-input' }
  }

  return {
    ok: true,
    value: asListing(input, { id, ownerId, status: 'active', createdAt }),
  }
}

export const updateGameListing = (
  listing: GameListing,
  input: GameListingInput,
  actorId: PlayerId,
): ListingResult<GameListing> => {
  if (listing.ownerId !== actorId) return { ok: false, error: 'not-owner' }
  if (!isActiveGameListing(listing)) return { ok: false, error: 'listing-closed' }
  if (!validateInput(input)) return { ok: false, error: 'invalid-input' }

  return {
    ok: true,
    value: asListing(input, listing),
  }
}

export const closeGameListing = (
  listing: GameListing,
  actorId: PlayerId,
): ListingResult<GameListing> => {
  if (listing.ownerId !== actorId) return { ok: false, error: 'not-owner' }
  if (!isActiveGameListing(listing)) return { ok: false, error: 'listing-closed' }

  return { ok: true, value: { ...listing, status: 'closed' } }
}
