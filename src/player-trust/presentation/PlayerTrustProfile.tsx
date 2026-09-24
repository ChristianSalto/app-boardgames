import type { Player } from '../../players/types'
import { usePlayerTrustSummary } from './PlayerTrustProvider'

export function PlayerTrustProfile({
  playerId,
  players,
}: {
  readonly playerId: string
  readonly players: readonly Player[]
}) {
  const summary = usePlayerTrustSummary(playerId)

  if (!summary) {
    return <section className="trust-profile" aria-live="polite"><p>Cargando valoraciones…</p></section>
  }

  return (
    <section className="trust-profile" aria-labelledby="trust-title">
      <div className="trust-profile__heading">
        <div>
          <p className="eyebrow">Señales de confianza</p>
          <h2 id="trust-title">Experiencia compartiendo mesa</h2>
        </div>
      </div>
      <div className="trust-summary">
        <section className="trust-summary__item">
          <h3>Reputación</h3>
          {summary.state === 'new' ? (
            <p className="trust-summary__value"><strong>Nuevo</strong><span>Sin valoraciones todavía</span></p>
          ) : (
            <p className="trust-summary__value">
              <strong>{summary.averageRating?.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span aria-hidden="true">★</span></strong>
              <span>{summary.reviewCount} {summary.reviewCount === 1 ? 'valoración' : 'valoraciones'}</span>
            </p>
          )}
        </section>
        <section className="trust-summary__item">
          <h3>Fiabilidad</h3>
          <p className="trust-summary__value trust-summary__value--text"><strong>Sin datos de asistencia verificados</strong></p>
        </section>
      </div>
      {summary.state === 'rated' ? (
        <section className="reviews" aria-labelledby="reviews-title">
          <div className="reviews__heading"><h3 id="reviews-title">Opiniones recientes</h3></div>
          <ul className="review-list">
            {summary.recentReviews.map((review) => {
              const reviewer = players.find((player) => player.id === review.reviewerId)
              return (
                <li key={review.id} className="review-card">
                  <div className="review-card__meta">
                    <span className="review-card__stars" aria-label={`${review.rating} de 5 estrellas`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
                  </div>
                  {review.comment ? <blockquote><p>“{review.comment}”</p></blockquote> : null}
                  <p className="review-card__author">{reviewer?.displayName ?? 'Jugador de Mesa Abierta'}</p>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </section>
  )
}

const formatReviewDate = (date: string) => new Intl.DateTimeFormat('es-ES', {
  day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(date))
