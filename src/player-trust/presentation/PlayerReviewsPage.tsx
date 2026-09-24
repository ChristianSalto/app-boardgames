import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePrototype } from '../../app/PrototypeContext'
import type { PlayerReviewCursor } from '../application/playerTrustRepository.ts'
import type { PlayerReview } from '../domain/playerReview.ts'
import { usePlayerTrust } from './PlayerTrustProvider'

export function PlayerReviewsPage() {
  const { playerId } = useParams()
  const { getPlayer, players } = usePrototype()
  const { getReviewsPage } = usePlayerTrust()
  const [reviews, setReviews] = useState<readonly PlayerReview[]>([])
  const [cursor, setCursor] = useState<PlayerReviewCursor | undefined>()
  const [loading, setLoading] = useState(true)
  const player = players.find((candidate) => candidate.id === playerId)

  useEffect(() => {
    if (playerId && !player) void getPlayer(playerId)
  }, [getPlayer, player, playerId])

  useEffect(() => {
    if (!playerId) return
    let active = true
    setLoading(true)
    void getReviewsPage(playerId).then((page) => {
      if (!active) return
      setReviews(page.reviews)
      setCursor(page.nextCursor)
      setLoading(false)
    })
    return () => { active = false }
  }, [getReviewsPage, playerId])

  if (!playerId) return null

  const loadMore = async () => {
    if (!cursor) return
    setLoading(true)
    const page = await getReviewsPage(playerId, cursor)
    setReviews((current) => [...current, ...page.reviews])
    setCursor(page.nextCursor)
    setLoading(false)
  }

  return (
    <section className="page-container page-section reviews-page">
      <nav aria-label="Migas de pan" className="breadcrumb"><ol><li><Link to={`/players/${playerId}`}>{player?.displayName ?? 'Perfil'}</Link></li><li aria-current="page">Opiniones</li></ol></nav>
      <header className="page-heading"><p className="eyebrow">Reputación</p><h1>Opiniones sobre {player?.displayName ?? 'este jugador'}</h1><p>Experiencias publicadas por personas que compartieron una partida confirmada.</p></header>
      {loading && reviews.length === 0 ? <p aria-live="polite">Cargando opiniones…</p> : null}
      {!loading && reviews.length === 0 ? <div className="empty-state empty-state--compact"><h2>Sin valoraciones todavía</h2><p>Las opiniones aparecerán aquí después de compartir partidas.</p></div> : null}
      {reviews.length > 0 ? <ul className="review-list">{reviews.map((review) => {
        const reviewer = players.find((candidate) => candidate.id === review.reviewerId)
        return <li className="review-card" key={review.id}><div className="review-card__meta"><span className="review-card__stars" aria-label={`${review.rating} de 5 estrellas`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span><time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time></div>{review.comment ? <blockquote><p>“{review.comment}”</p></blockquote> : null}<p className="review-card__author">{reviewer?.displayName ?? 'Jugador de Mesa Abierta'}</p></li>
      })}</ul> : null}
      {cursor ? <button className="button button--secondary" disabled={loading} onClick={() => void loadMore()} type="button">{loading ? 'Cargando…' : 'Mostrar más'}</button> : null}
    </section>
  )
}

const formatReviewDate = (date: string) => new Intl.DateTimeFormat('es-ES', {
  day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(date))
