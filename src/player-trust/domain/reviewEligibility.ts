export type ReviewSessionEvidence = Readonly<{
  sessionId: string
  gameName: string
  startsAt: string
  status: 'scheduled' | 'cancelled'
  participantIds: readonly string[]
}>

export type ReviewEligibilityReason =
  | 'session-not-found'
  | 'session-cancelled'
  | 'session-not-past'
  | 'reviewer-not-confirmed'
  | 'reviewed-player-not-confirmed'
  | 'self-review'

export type ReviewEligibility =
  | Readonly<{ kind: 'eligible' }>
  | Readonly<{ kind: 'ineligible'; reason: ReviewEligibilityReason }>

/**
 * Application validation uses the canonical session instant. Firestore Rules
 * are the trusted boundary for persisted reviews.
 */
export const getReviewEligibilityForEvidence = (
  evidence: ReviewSessionEvidence | null,
  reviewerId: string,
  reviewedPlayerId: string,
  now: Date,
): ReviewEligibility => {
  if (!evidence) return { kind: 'ineligible', reason: 'session-not-found' }
  if (evidence.status === 'cancelled') return { kind: 'ineligible', reason: 'session-cancelled' }
  if (new Date(evidence.startsAt).getTime() >= now.getTime()) {
    return { kind: 'ineligible', reason: 'session-not-past' }
  }
  if (!evidence.participantIds.includes(reviewerId)) {
    return { kind: 'ineligible', reason: 'reviewer-not-confirmed' }
  }
  if (!evidence.participantIds.includes(reviewedPlayerId)) {
    return { kind: 'ineligible', reason: 'reviewed-player-not-confirmed' }
  }
  if (reviewerId === reviewedPlayerId) return { kind: 'ineligible', reason: 'self-review' }
  return { kind: 'eligible' }
}
