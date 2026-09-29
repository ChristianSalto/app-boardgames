import { usePlayerTrustSummary } from './PlayerTrustProvider'

export function PlayerReputationSignal({
  playerId,
  showNoReviews = false,
}: {
  readonly playerId: string
  readonly showNoReviews?: boolean
}) {
  const summary = usePlayerTrustSummary(playerId)
  if (!summary) return null
  if (summary.state === 'new') {
    return <small className="organizer-reputation-signal">Nuevo en Mesa Abierta{showNoReviews ? ' · Sin valoraciones todavía' : ''}</small>
  }

  const rating = summary.averageRating?.toLocaleString('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  const reviewLabel = summary.reviewCount === 1 ? 'valoración' : 'valoraciones'

  return (
    <small className="organizer-reputation-signal">
      {rating ? <><span className="u-visually-hidden">Valoración media de </span><span aria-hidden="true">★</span> {rating}<span aria-hidden="true">/5</span><span className="u-visually-hidden"> sobre 5</span> · </> : null}
      {summary.reviewCount} {reviewLabel}
    </small>
  )
}
