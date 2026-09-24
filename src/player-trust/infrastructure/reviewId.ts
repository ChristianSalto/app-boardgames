import { serializeReviewIdentity, type ReviewIdGenerator } from '../domain/reviewId.ts'

export const createSha256ReviewId: ReviewIdGenerator = async (identity) => {
  const source = new TextEncoder().encode(serializeReviewIdentity(identity))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', source)
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}
