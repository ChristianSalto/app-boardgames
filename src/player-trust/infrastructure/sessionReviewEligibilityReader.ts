import type { GameSession } from '../../game-sessions/types.ts'
import type { ReviewEligibilityReader } from '../application/reviewEligibilityReader.ts'

export const createSessionReviewEligibilityReader = (
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
