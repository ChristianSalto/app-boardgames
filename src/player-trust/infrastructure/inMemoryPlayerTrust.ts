import type { GameSession } from '../../game-sessions/types.ts'
import type { ReviewEligibilityReader } from '../application/reviewEligibilityReader.ts'
import type { PlayerReviewRepository } from '../application/playerTrustRepository.ts'
import type { PlayerReview } from '../domain/playerReview.ts'
import { serializeReviewIdentity, type ReviewIdGenerator } from '../domain/reviewId.ts'

export const createSha256ReviewId: ReviewIdGenerator = async (identity) => {
  const source = new TextEncoder().encode(serializeReviewIdentity(identity))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', source)
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

export const createInMemoryPlayerReviewRepository = (
  initialReviews: readonly PlayerReview[] = [],
): PlayerReviewRepository => {
  const reviews = new Map(initialReviews.map((review) => [review.id, review]))

  return {
    create: async (review) => {
      if (reviews.has(review.id)) return 'duplicate'
      reviews.set(review.id, review)
      return 'created'
    },
    getReceivedBy: async (playerId) =>
      [...reviews.values()].filter((review) => review.reviewedPlayerId === playerId),
    getBySessionAndReviewer: async (sessionId, reviewerId) =>
      [...reviews.values()].filter(
        (review) => review.sessionId === sessionId && review.reviewerId === reviewerId,
      ),
  }
}

export const createInMemoryReviewEligibilityReader = (
  getSessions: () => readonly GameSession[],
): ReviewEligibilityReader => ({
  getSessionEvidence: async (sessionId) => {
    const session = getSessions().find((item) => item.id === sessionId)
    return session
      ? {
          sessionId: session.id,
          gameName: session.game,
          startsAt: session.startsAt,
          status: session.lifecycle,
          participantIds: session.participantIds,
        }
      : null
  },
})
