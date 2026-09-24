import type { PlayerReviewRepository } from '../application/playerTrustRepository.ts'
import type { PlayerReview } from '../domain/playerReview.ts'
export const createInMemoryPlayerReviewRepository = (
  initialReviews: readonly PlayerReview[] = [],
  now: () => Date = () => new Date(),
): PlayerReviewRepository => {
  const reviews = new Map(initialReviews.map((review) => [review.id, review]))

  return {
    create: async (review) => {
      if (reviews.has(review.id)) return { kind: 'duplicate' }
      const created = { ...review, createdAt: now().toISOString() }
      reviews.set(review.id, created)
      return { kind: 'created', review: created }
    },
    getReceivedBy: async (playerId) =>
      [...reviews.values()].filter((review) => review.reviewedPlayerId === playerId),
    getReceivedPage: async (playerId, pageSize, cursor) => {
      const ordered = [...reviews.values()]
        .filter((review) => review.reviewedPlayerId === playerId)
        .sort((first, second) => second.createdAt.localeCompare(first.createdAt) || first.id.localeCompare(second.id))
      const cursorIndex = cursor ? ordered.findIndex((review) => review.id === cursor.id) : -1
      const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0
      const page = ordered.slice(startIndex, startIndex + pageSize)
      const last = page.at(-1)
      return {
        reviews: page,
        ...(last && startIndex + pageSize < ordered.length
          ? { nextCursor: { createdAt: last.createdAt, id: last.id } }
          : {}),
      }
    },
    getBySessionAndReviewer: async (sessionId, reviewerId) =>
      [...reviews.values()].filter(
        (review) => review.sessionId === sessionId && review.reviewerId === reviewerId,
      ),
  }
}
