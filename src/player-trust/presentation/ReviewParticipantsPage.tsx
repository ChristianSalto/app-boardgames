import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePrototype } from '../../app/PrototypeContext'
import type { ReviewablePlayer } from '../application/playerTrust'
import { usePlayerTrust } from './PlayerTrustProvider'

export function ReviewParticipantsPage() {
  const { sessionId } = useParams()
  const { players, sessions } = usePrototype()
  const { getReviewablePlayers, submitReview, revision } = usePlayerTrust()
  const [reviewable, setReviewable] = useState<readonly ReviewablePlayer[] | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const session = sessions.find((item) => item.id === sessionId)

  const loadReviewablePlayers = () => {
    if (!sessionId) return
    setReviewable(null)
    void getReviewablePlayers(sessionId).then(setReviewable)
  }

  useEffect(loadReviewablePlayers, [getReviewablePlayers, revision, sessionId])

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId),
    [players, selectedPlayerId],
  )

  if (!session) {
    return <section className="page-container page-section"><div className="empty-state"><h1>Partida no encontrada</h1><Link className="button button--primary" to="/my-sessions">Volver a Mis partidas</Link></div></section>
  }

  return (
    <section className="page-container review-flow-page">
      <nav aria-label="Migas de pan" className="breadcrumb"><ol><li><Link to="/my-sessions">Mis partidas</Link></li><li><Link to={`/sessions/${session.id}`}>{session.game}</Link></li><li aria-current="page">Valorar participantes</li></ol></nav>
      <header className="page-intro"><p className="eyebrow">Después de la partida</p><h1>Valorar participantes</h1><p>Comparte una opinión sobre las personas con las que jugaste. Solo ellas podrán recibirla en su perfil.</p></header>
      {message ? <div className="feedback-banner" role="status"><span aria-hidden="true">✓</span><p>{message}</p></div> : null}
      {!reviewable ? <p aria-live="polite">Cargando participantes…</p> : (
        <div className="review-flow-layout">
          <section className="content-block" aria-labelledby="reviewable-players-title">
            <h2 id="reviewable-players-title">Participantes</h2>
            {reviewable.length === 0 ? <p>No hay participantes disponibles para valorar en esta partida.</p> : (
              <ul className="review-participant-list">
                {reviewable.map((item) => {
                  const player = players.find((candidate) => candidate.id === item.playerId)
                  return <li key={item.playerId}>
                    <div className="review-participant-list__identity"><span className="avatar" aria-hidden="true">{initials(player?.displayName ?? '')}</span><span><strong>{player?.displayName ?? 'Jugador de Mesa Abierta'}</strong><small>{item.reviewState === 'submitted' ? 'Valoración enviada' : 'Pendiente de valorar'}</small></span></div>
                    {item.reviewState === 'pending' ? <button className="button button--secondary" type="button" onClick={() => { setSelectedPlayerId(item.playerId); setMessage('') }}>Valorar</button> : <span className="status-pill status-pill--open">Enviada</span>}
                  </li>
                })}
              </ul>
            )}
          </section>
          {selectedPlayer && sessionId ? <ReviewForm key={selectedPlayer.id} playerName={selectedPlayer.displayName} onCancel={() => setSelectedPlayerId(null)} onSubmit={async (rating, comment) => {
            const result = await submitReview({ sessionId, reviewedPlayerId: selectedPlayer.id, rating, comment })
            if (result.kind === 'created') {
              setMessage(`Tu valoración para ${selectedPlayer.displayName} se ha publicado.`)
              setSelectedPlayerId(null)
              loadReviewablePlayers()
              return undefined
            }
            return result.kind === 'duplicate' ? 'Esta valoración ya se había enviado.' : 'No se ha podido publicar la valoración. Comprueba los datos e inténtalo de nuevo.'
          }} /> : null}
        </div>
      )}
    </section>
  )
}

function ReviewForm({
  playerName,
  onCancel,
  onSubmit,
}: {
  readonly playerName: string
  readonly onCancel: () => void
  readonly onSubmit: (rating: number, comment: string) => Promise<string | undefined>
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!rating) { setError('Selecciona una valoración de 1 a 5 estrellas.'); return }
    setSubmitting(true)
    setError('')
    const result = await onSubmit(rating, comment)
    setSubmitting(false)
    if (result) setError(result)
  }

  return <form className="form-card review-form" onSubmit={handleSubmit}>
    <div><p className="eyebrow">Tu valoración</p><h2>Valorar a {playerName}</h2></div>
    <fieldset className="review-rating-field"><legend>¿Cómo fue compartir mesa con {playerName}?</legend><div className="review-rating-options">
      {[1, 2, 3, 4, 5].map((value) => <label key={value} className="review-rating-option"><input checked={rating === value} name="rating" onChange={() => setRating(value)} type="radio" value={value} /><span aria-hidden="true">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span><span>{value} {value === 1 ? 'estrella' : 'estrellas'}</span></label>)}
    </div></fieldset>
    <div className="field-group"><label htmlFor="review-comment">Comentario <span className="field-optional">(opcional)</span></label><textarea id="review-comment" value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} aria-describedby="review-comment-count" rows={5} /><p id="review-comment-count" className="field-hint">{comment.length}/500 caracteres</p></div>
    <section className="review-preview" aria-label="Revisión antes de publicar"><h3>Antes de publicar</h3><p><strong>{playerName}</strong> · {rating ? `${rating} de 5 estrellas` : 'Selecciona una valoración'}</p>{comment.trim() ? <p>“{comment.trim()}”</p> : <p>Sin comentario.</p>}</section>
    {error ? <p className="field-error" role="alert">{error}</p> : null}
    <div className="request-card__actions"><button className="button button--primary" disabled={submitting} type="submit">{submitting ? 'Publicando…' : 'Publicar valoración'}</button><button className="button button--ghost" onClick={onCancel} type="button">Cancelar</button></div>
  </form>
}

const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
