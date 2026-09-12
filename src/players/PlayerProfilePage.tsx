import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { AppIcon } from '../shared/AppIcon'
import type { PlayerTrustSignals } from './types'
import { MyListingsSection } from '../game-listings/presentation/MyListingsSection'

export function PlayerProfilePage() {
  const { playerId } = useParams()
  const location = useLocation()
  const locationState = location.state as { readonly from?: string; readonly fromLabel?: string } | null
  const { currentPlayerId, players, sessions } = usePrototype()
  const targetId = playerId ?? currentPlayerId
  const player = players.find((item) => item.id === targetId)
  const isOwnProfile = targetId === currentPlayerId
  const activity = useMemo(() => ({
    organized: sessions.filter((session) => session.organizerId === targetId).length,
    confirmed: sessions.filter((session) => session.organizerId !== targetId && session.participantIds.includes(targetId)).length,
  }), [sessions, targetId])

  if (!player) return <section className="page-container page-section"><div className="empty-state"><h1>Perfil no encontrado</h1><Link className="button button--primary" to="/">Volver a Explorar</Link></div></section>

  return <section className="page-container profile-page">
    {!isOwnProfile ? <nav aria-label="Migas de pan" className="breadcrumb"><ol><li><Link to={locationState?.from ?? '/'}>{locationState?.fromLabel ?? 'Explorar'}</Link></li><li aria-current="page">{player.displayName}</li></ol></nav> : null}
    <article className="profile-card">
      <div className="profile-card__top"><div className="avatar avatar--large" aria-hidden="true">{getInitials(player.displayName)}</div><div><p className="eyebrow">{isOwnProfile ? 'Tu perfil' : 'Perfil de jugador'}</p><h1>{player.displayName}</h1><p className="profile-location"><AppIcon name="location" size={18} /> {player.city}{player.district ? ` · ${player.district}` : ''}</p></div></div>
      <div className="profile-about"><h2>Sobre {isOwnProfile ? 'ti' : player.displayName.split(' ')[0]}</h2><p>{player.description || 'Esta persona todavía no ha añadido una descripción.'}</p></div>
      {player.trust ? <TrustProfile trust={player.trust} /> : <section className="trust-profile"><h2>Señales de confianza</h2><p>Las valoraciones y señales de fiabilidad aún no están disponibles para este perfil.</p></section>}
      <dl className="profile-stats profile-stats--activity"><div><dt>Organizadas en la app</dt><dd>{activity.organized}</dd></div><div><dt>Participaciones en la app</dt><dd>{activity.confirmed}</dd></div></dl>
      {isOwnProfile ? <MyListingsSection /> : null}
    </article>
  </section>
}

function TrustProfile({ trust }: { readonly trust: PlayerTrustSignals }) {
  return <div className="trust-profile"><div className="trust-profile__heading"><div><p className="eyebrow">Señales de confianza</p><h2>Experiencia compartiendo mesa</h2></div><span className="prototype-badge">Datos simulados</span></div><div className="trust-summary"><section className="trust-summary__item"><h3>Reputación</h3><p className="trust-summary__value"><strong>{trust.averageRating.toLocaleString('es-ES', { minimumFractionDigits: 1 })} <span aria-hidden="true">★</span></strong><span>{trust.ratingCount} valoraciones</span></p></section><section className="trust-summary__item"><h3>Fiabilidad</h3><p className="trust-summary__value"><strong>{trust.attendedGames} de {trust.gamesPlayed}</strong><span>partidas asistidas</span></p></section></div></div>
}

const getInitials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
