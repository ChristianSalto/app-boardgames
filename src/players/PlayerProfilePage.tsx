import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { madridZones } from '../mock-data/prototypeData'
import { AppIcon } from '../shared/AppIcon'
import type { PlayerTrustSignals } from './types'

export function PlayerProfilePage() {
  const { playerId } = useParams()
  const location = useLocation()
  const locationState = location.state as {
    readonly from?: string
    readonly fromLabel?: string
    readonly rootFrom?: string
    readonly rootLabel?: string
  } | null
  const { currentPlayerId, players, sessions, updateCurrentPlayer } = usePrototype()
  const targetId = playerId ?? currentPlayerId
  const player = players.find((item) => item.id === targetId)
  const isOwnProfile = targetId === currentPlayerId
  const [isEditing, setIsEditing] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [name, setName] = useState(player?.name ?? '')
  const [zone, setZone] = useState(player?.zone ?? '')
  const [description, setDescription] = useState(player?.description ?? '')
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    setIsEditing(false)
    setSavedMessage('')
    setName(player?.name ?? '')
    setZone(player?.zone ?? '')
    setDescription(player?.description ?? '')
  }, [player?.description, player?.name, player?.zone, targetId])

  const activity = useMemo(() => {
    const organized = sessions.filter((session) => session.organizerId === targetId).length
    const confirmed = sessions.filter(
      (session) => session.organizerId !== targetId && session.participantIds.includes(targetId),
    ).length
    return { organized, confirmed }
  }, [sessions, targetId])

  if (!player) {
    return (
      <section className="page-container page-section">
        <div className="empty-state">
          <h1>Perfil no encontrado</h1>
          <p>No hemos podido encontrar a esta persona.</p>
          <Link className="button button--primary" to="/">Volver a Explorar</Link>
        </div>
      </section>
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setNameError('Escribe un nombre visible.')
      return
    }
    updateCurrentPlayer({ name, zone, description })
    setIsEditing(false)
    setSavedMessage('Perfil actualizado correctamente.')
  }

  return (
    <section className="page-container profile-page">
      {!isOwnProfile ? (
        <nav aria-label="Migas de pan" className="breadcrumb">
          <ol>
            {locationState?.rootFrom && locationState.rootLabel ? (
              <li><Link to={locationState.rootFrom}>{locationState.rootLabel}</Link></li>
            ) : null}
            <li>
              <Link
                state={locationState?.rootFrom && locationState.rootLabel ? {
                  from: locationState.rootFrom,
                  fromLabel: locationState.rootLabel,
                } : undefined}
                to={locationState?.from ?? '/'}
              >
                {locationState?.fromLabel ?? 'Explorar'}
              </Link>
            </li>
            <li aria-current="page">{player.name}</li>
          </ol>
        </nav>
      ) : null}
      {savedMessage ? <div className="feedback-banner" role="status"><span aria-hidden="true">✓</span><p>{savedMessage}</p></div> : null}

      <article className="profile-card">
        <div className="profile-card__top">
          <div className="avatar avatar--large" aria-hidden="true">{getInitials(player.name)}</div>
          <div>
            <p className="eyebrow">{isOwnProfile ? 'Tu perfil' : 'Perfil de jugador'}</p>
            <h1>{player.name}</h1>
            <p className="profile-location"><AppIcon name="location" size={18} /> {player.city}{player.zone ? ` · ${player.zone}` : ''}</p>
          </div>
        </div>

        {isEditing && isOwnProfile ? (
          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="profile-name">Nombre visible *</label>
              <input
                aria-describedby={nameError ? 'profile-name-error' : undefined}
                aria-invalid={Boolean(nameError)}
                id="profile-name"
                onChange={(event) => { setName(event.target.value); setNameError('') }}
                value={name}
              />
              {nameError ? <p className="field__error" id="profile-name-error">{nameError}</p> : null}
            </div>
            <div className="fixed-field">
              <span>Ciudad</span><strong>Madrid</strong><small>Contexto fijo del prototipo</small>
            </div>
            <div className="field">
              <label htmlFor="profile-zone">Zona o distrito <span>(opcional)</span></label>
              <select id="profile-zone" onChange={(event) => setZone(event.target.value)} value={zone}>
                <option value="">Prefiero no indicarla</option>
                {madridZones.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="profile-description">Sobre ti <span>(opcional)</span></label>
              <textarea id="profile-description" maxLength={240} onChange={(event) => setDescription(event.target.value)} rows={4} value={description} />
            </div>
            <div className="profile-form__actions">
              <button className="button button--primary" type="submit">Guardar cambios</button>
              <button className="button button--ghost" onClick={() => setIsEditing(false)} type="button">Cancelar</button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-about">
              <h2>Sobre {isOwnProfile ? 'ti' : player.name.split(' ')[0]}</h2>
              <p>{player.description || 'Esta persona todavía no ha añadido una descripción.'}</p>
            </div>
            <TrustProfile trust={player.trust} />
            <dl className="profile-stats profile-stats--activity">
              <div><dt>Organizadas en la app</dt><dd>{activity.organized}</dd></div>
              <div><dt>Participaciones en la app</dt><dd>{activity.confirmed}</dd></div>
            </dl>
            {isOwnProfile ? (
              <button className="button button--secondary" onClick={() => { setIsEditing(true); setSavedMessage('') }} type="button">Editar perfil</button>
            ) : null}
          </>
        )}
      </article>
    </section>
  )
}

function TrustProfile({ trust }: { readonly trust: PlayerTrustSignals }) {
  return (
    <div className="trust-profile">
      <div className="trust-profile__heading">
        <div>
          <p className="eyebrow">Señales de confianza</p>
          <h2>Experiencia compartiendo mesa</h2>
        </div>
        <span className="prototype-badge">Datos simulados</span>
      </div>

      <div className="trust-summary">
        <section className="trust-summary__item" aria-labelledby="reputation-title">
          <h3 id="reputation-title">Reputación</h3>
          <p className="trust-summary__value">
            <strong>{formatRating(trust.averageRating)} <span aria-hidden="true">★</span></strong>
            <span>{trust.ratingCount} valoraciones</span>
          </p>
          <p>Opiniones publicadas después de compartir mesa.</p>
        </section>
        <section className="trust-summary__item" aria-labelledby="reliability-title">
          <h3 id="reliability-title">Fiabilidad</h3>
          <p className="trust-summary__value">
            <strong>{trust.attendedGames} de {trust.gamesPlayed}</strong>
            <span>partidas asistidas</span>
          </p>
          <p>{trust.noShows === 0 ? 'Ninguna ausencia sin aviso' : `${trust.noShows} ${trust.noShows === 1 ? 'ausencia' : 'ausencias'} sin aviso`}.</p>
        </section>
      </div>

      <section className="trust-highlights" aria-labelledby="highlights-title">
        <h3 id="highlights-title">Lo que más destacan</h3>
        <ul>
          {trust.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
      </section>

      <section className="reviews" aria-labelledby="reviews-title">
        <div className="reviews__heading">
          <h3 id="reviews-title">Opiniones recientes</h3>
          <p>De jugadores que compartieron una partida confirmada.</p>
        </div>
        <ul className="review-list">
          {trust.reviews.map((review) => (
            <li key={review.id}>
              <article className="review-card">
                <div className="review-card__meta">
                  <span className="review-card__stars">
                    <span className="u-visually-hidden">{review.rating} de 5 estrellas</span>
                    <span aria-hidden="true">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </span>
                  <span>{review.game}</span>
                </div>
                <blockquote><p>“{review.comment}”</p></blockquote>
                <p className="review-card__author">{review.authorName}</p>
              </article>
            </li>
          ))}
        </ul>
        <p className="trust-disclaimer">
          Hipótesis del prototipo: en el producto futuro solo podrían valorar quienes
          hubieran compartido una partida finalizada y estuvieran confirmados.
        </p>
      </section>
    </div>
  )
}

const formatRating = (rating: number) => rating.toLocaleString('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const getInitials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
