import {
  createPlayerReviewRecord,
  type CreatePlayerReviewInput,
  type PlayerReview,
  type ReviewValidationFailure,
} from '../domain/playerReview.ts'
import {
  getReviewEligibilityForEvidence,
  type ReviewEligibility,
} from '../domain/reviewEligibility.ts'
import type { ReviewIdGenerator } from '../domain/reviewId.ts'
import type { ReviewEligibilityReader } from './reviewEligibilityReader.ts'
import type { PlayerReviewRepository } from './playerTrustRepository.ts'
import type { PlayerReviewCursor } from './playerTrustRepository.ts'

type ReviewDependencies = Readonly<{
  reviewRepository: PlayerReviewRepository
  eligibilityReader: ReviewEligibilityReader
  createReviewId: ReviewIdGenerator
  now: () => Date
}>

export type CreatePlayerReviewResult =
  | Readonly<{ kind: 'created'; review: PlayerReview }>
  | Readonly<{ kind: 'duplicate' }>
  | Readonly<{ kind: 'ineligible'; eligibility: ReviewEligibility }>
  | Readonly<{ kind: 'invalid'; reason: ReviewValidationFailure }>

export type ReviewablePlayer = Readonly<{
  playerId: string
  reviewState: 'pending' | 'submitted'
}>

export type PlayerTrustSummary = Readonly<{
  state: 'new' | 'rated'
  averageRating?: number
  reviewCount: number
  recentReviews: readonly PlayerReview[]
}>

export const getReviewEligibility = async (
  dependencies: Pick<ReviewDependencies, 'eligibilityReader' | 'now'>,
  sessionId: string,
  reviewerId: string,
  reviewedPlayerId: string,
) => getReviewEligibilityForEvidence(
  await dependencies.eligibilityReader.getSessionEvidence(sessionId),
  reviewerId,
  reviewedPlayerId,
  dependencies.now(),
)

export const getReviewablePlayersForSession = async (
  dependencies: Pick<ReviewDependencies, 'eligibilityReader' | 'reviewRepository' | 'now'>,
  sessionId: string,
  reviewerId: string,
): Promise<readonly ReviewablePlayer[]> => {
  const evidence = await dependencies.eligibilityReader.getSessionEvidence(sessionId)
  if (
    !evidence
    || evidence.status === 'cancelled'
    || new Date(evidence.startsAt).getTime() >= dependencies.now().getTime()
    || !evidence.participantIds.includes(reviewerId)
  ) {
    return []
  }

  const submitted = await dependencies.reviewRepository.getBySessionAndReviewer(sessionId, reviewerId)
  const reviewedIds = new Set(submitted.map((review) => review.reviewedPlayerId))

  return evidence.participantIds
    .filter((playerId) => playerId !== reviewerId)
    .map((playerId) => {
      const eligibility = getReviewEligibilityForEvidence(
        evidence,
        reviewerId,
        playerId,
        dependencies.now(),
      )
      return {
        playerId,
        reviewState: reviewedIds.has(playerId) || eligibility.kind === 'ineligible'
          ? 'submitted' as const
          : 'pending' as const,
      }
    })
}

export const createPlayerReview = async (
  dependencies: ReviewDependencies,
  input: CreatePlayerReviewInput,
): Promise<CreatePlayerReviewResult> => {
  const eligibility = await getReviewEligibility(
    dependencies,
    input.sessionId,
    input.reviewerId,
    input.reviewedPlayerId,
  )
  if (eligibility.kind === 'ineligible') return { kind: 'ineligible', eligibility }

  const id = await dependencies.createReviewId(input)
  const creation = createPlayerReviewRecord(input, id)
  if (creation.kind === 'invalid') return creation

  const result = await dependencies.reviewRepository.create(creation.review)
  return result.kind === 'duplicate' ? result : { kind: 'created', review: result.review }
}

export const getPlayerReviews = (
  repository: PlayerReviewRepository,
  playerId: string,
) => repository.getReceivedBy(playerId)

export const getPlayerReviewsPage = (
  repository: PlayerReviewRepository,
  playerId: string,
  pageSize = 10,
  cursor?: PlayerReviewCursor,
) => repository.getReceivedPage(playerId, pageSize, cursor)

export const getPlayerTrustSummary = async (
  repository: PlayerReviewRepository,
  playerId: string,
): Promise<PlayerTrustSummary> => {
  const reviews = await getPlayerReviews(repository, playerId)
  const ordered = [...reviews].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  )
  if (ordered.length === 0) {
    return { state: 'new', reviewCount: 0, recentReviews: [] }
  }

  const reviewCount = ordered.length
  const averageRating = ordered.reduce((total, review) => total + review.rating, 0) / reviewCount
  return {
    state: 'rated',
    averageRating,
    reviewCount,
    recentReviews: ordered.slice(0, 3),
  }
}
