import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlayerTrust } from './PlayerTrustProvider'

export function ReviewParticipantsAction({ sessionId }: { readonly sessionId: string }) {
  const { getReviewablePlayers, revision } = usePlayerTrust()
  const [hasEligiblePlayers, setHasEligiblePlayers] = useState(false)

  useEffect(() => {
    let active = true
    void getReviewablePlayers(sessionId).then((players) => {
      if (active) setHasEligiblePlayers(players.some((player) => player.reviewState === 'pending'))
    })
    return () => { active = false }
  }, [getReviewablePlayers, revision, sessionId])

  if (!hasEligiblePlayers) return null

  return (
    <section className="content-block review-action" aria-labelledby="review-action-title">
      <p className="eyebrow">Después de la partida</p>
      <h2 id="review-action-title">Comparte tu experiencia</h2>
      <p>Tu opinión ayuda a otras personas a conocer mejor a quienes comparten mesa.</p>
      <Link className="button button--primary" to={`/sessions/${sessionId}/reviews`}>Valorar participantes</Link>
    </section>
  )
}
