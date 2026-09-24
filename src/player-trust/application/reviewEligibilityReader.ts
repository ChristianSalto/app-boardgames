import type { ReviewSessionEvidence } from '../domain/reviewEligibility.ts'

export type ReviewEligibilityReader = Readonly<{
  getSessionEvidence: (sessionId: string) => Promise<ReviewSessionEvidence | null>
}>
