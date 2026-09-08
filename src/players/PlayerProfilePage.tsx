import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { madridZones } from '../mock-data/prototypeData'
import { AppIcon } from '../shared/AppIcon'

export function PlayerProfilePage() {
  const { playerId } = useParams()
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
      {!isOwnProfile ? <Link className="back-link" to="/">← Volver a Explorar</Link> : null}
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
            <dl className="profile-stats">
              <div><dt>Partidas organizadas</dt><dd>{activity.organized}</dd></div>
              <div><dt>Participaciones</dt><dd>{activity.confirmed}</dd></div>
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

const getInitials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
