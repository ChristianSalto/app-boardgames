import type { GameListingId, PlayerId } from '../domain/gameListing.ts'

export type ListingImageUpload = Readonly<{
  bytes: Uint8Array
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
}>

export type ListingImageRepository = Readonly<{
  uploadCover: (ownerId: PlayerId, listingId: GameListingId, image: ListingImageUpload) => Promise<string>
  deleteCover: (ownerId: PlayerId, listingId: GameListingId) => Promise<void>
}>
