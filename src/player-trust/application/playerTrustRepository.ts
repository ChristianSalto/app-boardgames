import type { PlayerReview } from '../domain/playerReview.ts'

export type PlayerReviewRepository = Readonly<{
  create: (review: PlayerReview) => Promise<'created' | 'duplicate'>
  getReceivedBy: (playerId: string) => Promise<readonly PlayerReview[]>
  getBySessionAndReviewer: (
    sessionId: string,
    reviewerId: string,
  ) => Promise<readonly PlayerReview[]>
}>
