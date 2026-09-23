import { deleteObject, getDownloadURL, ref, uploadBytes, type FirebaseStorage } from 'firebase/storage'
import type { ListingImageRepository } from '../application/listingImageRepository.ts'
import { createListingOperationFailure } from '../application/listingOperationFailure.ts'

const coverPath = (ownerId: string, listingId: string) => `game-listings/${ownerId}/${listingId}/cover`

export const createFirebaseListingImageRepository = (storage: FirebaseStorage): ListingImageRepository => ({
  uploadCover: async (ownerId, listingId, image) => {
    const reference = ref(storage, coverPath(ownerId, listingId))
    try {
      await uploadBytes(reference, image.bytes, { contentType: image.contentType })
    } catch { throw createListingOperationFailure('image-upload-failed') }
    try {
      return await getDownloadURL(reference)
    } catch { throw createListingOperationFailure('image-url-failed') }
  },
  deleteCover: async (ownerId, listingId) => {
    try { await deleteObject(ref(storage, coverPath(ownerId, listingId))) } catch { /* cleanup is best effort */ }
  },
})
