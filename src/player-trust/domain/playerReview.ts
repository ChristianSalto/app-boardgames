import type { ReviewIdentity } from './reviewId.ts'

export type PlayerReview = Readonly<ReviewIdentity & {
  id: string
  rating: number
  comment?: string
  createdAt: string
}>

export type PlayerReviewDraft = Readonly<Omit<PlayerReview, 'createdAt'>>

export type CreatePlayerReviewInput = Readonly<{
  sessionId: string
  reviewerId: string
  reviewedPlayerId: string
  rating: number
  comment?: string
}>

export type ReviewValidationFailure =
  | 'invalid-rating'
  | 'self-review'
  | 'comment-too-long'

export type ReviewCreation =
  | Readonly<{ kind: 'created'; review: PlayerReviewDraft }>
  | Readonly<{ kind: 'invalid'; reason: ReviewValidationFailure }>

export const maximumReviewCommentLength = 500

export const normalizeReviewComment = (comment: string | undefined) => {
  const normalized = comment?.trim()
  return normalized ? normalized : undefined
}

export const isValidReviewRating = (rating: number) =>
  Number.isInteger(rating) && rating >= 1 && rating <= 5

export const createPlayerReviewRecord = (
  input: CreatePlayerReviewInput,
  id: string,
): ReviewCreation => {
  if (!isValidReviewRating(input.rating)) return { kind: 'invalid', reason: 'invalid-rating' }
  if (input.reviewerId === input.reviewedPlayerId) return { kind: 'invalid', reason: 'self-review' }

  const comment = normalizeReviewComment(input.comment)
  if (comment && comment.length > maximumReviewCommentLength) {
    return { kind: 'invalid', reason: 'comment-too-long' }
  }

  return {
    kind: 'created',
    review: {
      id,
      sessionId: input.sessionId,
      reviewerId: input.reviewerId,
      reviewedPlayerId: input.reviewedPlayerId,
      rating: input.rating,
      ...(comment ? { comment } : {}),
    },
  }
}
