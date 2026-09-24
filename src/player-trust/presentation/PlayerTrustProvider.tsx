import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePrototype } from '../../app/PrototypeContext'
import {
  createPlayerReview,
  getPlayerTrustSummary,
  getReviewablePlayersForSession,
  type CreatePlayerReviewResult,
  type PlayerTrustSummary,
  type ReviewablePlayer,
} from '../application/playerTrust'
import type { PlayerReviewRepository } from '../application/playerTrustRepository'
import type { ReviewEligibilityReader } from '../application/reviewEligibilityReader'
import {
  createInMemoryPlayerReviewRepository,
  createInMemoryReviewEligibilityReader,
  createSha256ReviewId,
} from '../infrastructure/inMemoryPlayerTrust'

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
}>

const PlayerTrustContext = createContext<PlayerTrustContextValue | undefined>(undefined)

export function PlayerTrustProvider({ children }: { readonly children: ReactNode }) {
  const { currentPlayerId, sessions } = usePrototype()
  const sessionsRef = useRef(sessions)
  const repositoryRef = useRef<PlayerReviewRepository | null>(null)
  const eligibilityReaderRef = useRef<ReviewEligibilityReader | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    sessionsRef.current = sessions
  }, [sessions])

  if (!repositoryRef.current) {
    repositoryRef.current = createInMemoryPlayerReviewRepository()
  }

  if (!eligibilityReaderRef.current) {
    eligibilityReaderRef.current = createInMemoryReviewEligibilityReader(() => sessionsRef.current)
  }

  const getReviewablePlayers = useCallback(
    (sessionId: string) => getReviewablePlayersForSession(
      {
        eligibilityReader: eligibilityReaderRef.current!,
        reviewRepository: repositoryRef.current!,
        now: () => new Date(),
      },
      sessionId,
      currentPlayerId,
    ),
    [currentPlayerId],
  )

  const submitReview = useCallback(async (input: SubmitReviewInput) => {
    const result = await createPlayerReview(
      {
        eligibilityReader: eligibilityReaderRef.current!,
        reviewRepository: repositoryRef.current!,
        createReviewId: createSha256ReviewId,
        now: () => new Date(),
      },
      { ...input, reviewerId: currentPlayerId },
    )
    if (result.kind === 'created') setRevision((current) => current + 1)
    return result
  }, [currentPlayerId])

  const getTrustSummary = useCallback(
    (playerId: string) => getPlayerTrustSummary(repositoryRef.current!, playerId),
    [],
  )

  const value = useMemo<PlayerTrustContextValue>(
    () => ({ revision, getReviewablePlayers, submitReview, getTrustSummary }),
    [getReviewablePlayers, getTrustSummary, revision, submitReview],
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
