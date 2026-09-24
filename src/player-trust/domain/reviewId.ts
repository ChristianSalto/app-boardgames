export type ReviewIdentity = Readonly<{
  sessionId: string
  reviewerId: string
  reviewedPlayerId: string
}>

/**
 * Canonical serialization shared by the future Firestore Rules implementation.
 * A JSON array preserves each boundary even if an identifier contains delimiters.
 */
export const serializeReviewIdentity = ({
  sessionId,
  reviewerId,
  reviewedPlayerId,
}: ReviewIdentity) => JSON.stringify([sessionId, reviewerId, reviewedPlayerId])

export type ReviewIdGenerator = (identity: ReviewIdentity) => Promise<string>
