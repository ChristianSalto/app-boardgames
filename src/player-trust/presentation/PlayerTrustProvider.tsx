import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePrototype } from '../../app/PrototypeContext'
import {
  createPlayerReview,
  getPlayerReviewsPage,
  getPlayerTrustSummary,
  getReviewablePlayersForSession,
  type CreatePlayerReviewResult,
  type PlayerTrustSummary,
  type ReviewablePlayer,
} from '../application/playerTrust'
import type { PlayerReviewRepository } from '../application/playerTrustRepository'
import type { PlayerReviewCursor, PlayerReviewPage } from '../application/playerTrustRepository'
import type { ReviewEligibilityReader } from '../application/reviewEligibilityReader'
import { createSessionReviewEligibilityReader } from '../infrastructure/sessionReviewEligibilityReader'
import { createSha256ReviewId } from '../infrastructure/reviewId'

type SubmitReviewInput = Readonly<{
  sessionId: string
  reviewedPlayerId: string
  rating: number
  comment?: string
}>

type PlayerTrustContextValue = Readonly<{
  revision: number
  getReviewablePlayers: (sessionId: string) => Promise<readonly ReviewablePlayer[]>
  submitReview: (input: SubmitReviewInput) => Promise<CreatePlayerReviewResult>
  getTrustSummary: (playerId: string) => Promise<PlayerTrustSummary>
  getReviewsPage: (playerId: string, cursor?: PlayerReviewCursor) => Promise<PlayerReviewPage>
}>

const PlayerTrustContext = createContext<PlayerTrustContextValue | undefined>(undefined)

export function PlayerTrustProvider({
  children,
  repository,
}: {
  readonly children: ReactNode
  readonly repository: PlayerReviewRepository
}) {
  const { currentPlayerId, sessions } = usePrototype()
  const [revision, setRevision] = useState(0)
  const eligibilityReader = useMemo<ReviewEligibilityReader>(
    () => createSessionReviewEligibilityReader(() => sessions),
    [sessions],
  )

  const getReviewablePlayers = useCallback(
    (sessionId: string) => getReviewablePlayersForSession(
      {
        eligibilityReader,
        reviewRepository: repository,
        now: () => new Date(),
      },
      sessionId,
      currentPlayerId,
    ),
    [currentPlayerId, eligibilityReader, repository],
  )

  const submitReview = useCallback(async (input: SubmitReviewInput) => {
    const result = await createPlayerReview(
      {
        eligibilityReader,
        reviewRepository: repository,
        createReviewId: createSha256ReviewId,
        now: () => new Date(),
      },
      { ...input, reviewerId: currentPlayerId },
    )
    if (result.kind === 'created') setRevision((current) => current + 1)
    return result
  }, [currentPlayerId, eligibilityReader, repository])

  const getTrustSummary = useCallback(
    (playerId: string) => getPlayerTrustSummary(repository, playerId),
    [repository],
  )

  const getReviewsPage = useCallback(
    (playerId: string, cursor?: PlayerReviewCursor) =>
      getPlayerReviewsPage(repository, playerId, 10, cursor),
    [repository],
  )

  const value = useMemo<PlayerTrustContextValue>(
    () => ({ revision, getReviewablePlayers, submitReview, getTrustSummary, getReviewsPage }),
    [getReviewablePlayers, getReviewsPage, getTrustSummary, revision, submitReview],
  )

  return <PlayerTrustContext.Provider value={value}>{children}</PlayerTrustContext.Provider>
}

export const usePlayerTrust = () => {
  const context = useContext(PlayerTrustContext)
  if (!context) throw new Error('usePlayerTrust must be used inside PlayerTrustProvider')
  return context
}

export const usePlayerTrustSummary = (playerId: string) => {
  const { getTrustSummary, revision } = usePlayerTrust()
  const [summary, setSummary] = useState<PlayerTrustSummary | null>(null)

  useEffect(() => {
    let active = true
    setSummary(null)
    void getTrustSummary(playerId).then((result) => {
      if (active) setSummary(result)
    })
    return () => { active = false }
  }, [getTrustSummary, playerId, revision])

  return summary
}
