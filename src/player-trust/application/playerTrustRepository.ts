import type { PlayerReview, PlayerReviewDraft } from '../domain/playerReview.ts'

export type PlayerReviewCursor = Readonly<{
  createdAt: string
  id: string
}>

export type PlayerReviewPage = Readonly<{
  reviews: readonly PlayerReview[]
  nextCursor?: PlayerReviewCursor
}>

export type CreatePlayerReviewRepositoryResult =
  | Readonly<{ kind: 'created'; review: PlayerReview }>
  | Readonly<{ kind: 'duplicate' }>

export type PlayerReviewRepository = Readonly<{
  create: (review: PlayerReviewDraft) => Promise<CreatePlayerReviewRepositoryResult>
  getReceivedBy: (playerId: string) => Promise<readonly PlayerReview[]>
  getReceivedPage: (
    playerId: string,
    pageSize: number,
    cursor?: PlayerReviewCursor,
  ) => Promise<PlayerReviewPage>
  getBySessionAndReviewer: (
    sessionId: string,
    reviewerId: string,
  ) => Promise<readonly PlayerReview[]>
}>
