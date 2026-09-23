export const listingOperationFailureKinds = [
  'image-upload-failed',
  'image-url-failed',
  'listing-persistence-failed',
] as const

export type ListingOperationFailureKind = (typeof listingOperationFailureKinds)[number]

export type ListingOperationFailure = Readonly<{
  kind: ListingOperationFailureKind
}>

export const createListingOperationFailure = (
  kind: ListingOperationFailureKind,
): ListingOperationFailure => ({ kind })

export const isListingOperationFailure = (
  value: unknown,
): value is ListingOperationFailure => (
  typeof value === 'object'
  && value !== null
  && 'kind' in value
  && typeof value.kind === 'string'
  && listingOperationFailureKinds.includes(value.kind as ListingOperationFailureKind)
)
