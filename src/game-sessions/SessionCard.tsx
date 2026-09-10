import { Link } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { AppIcon } from '../shared/AppIcon'
import {
  formatSessionDate,
  formatSessionTime,
  getGameInitials,
  getRemainingSeats,
  getSessionDisplayState,
  getUserRelation,
} from './model'
import type { GameSession } from './types'

const relationLabels = {
  organizer: 'Organizada por ti',
  confirmed: 'Participación confirmada',
  pending: 'Solicitud pendiente',
  declined: 'Solicitud no aceptada',
  'not-confirmed': 'Sin confirmar · aforo completo',
  none: '',
} as const

const stateLabels = {
  open: 'Abierta',
  complete: 'Completa',
  cancelled: 'Cancelada',
  past: 'Pasada',
} as const

type SessionCardProps = {
  readonly session: GameSession
  readonly showRelation?: boolean
}

export function SessionCard({ session, showRelation = false }: SessionCardProps) {
  const { currentPlayerId, players } = usePrototype()
  const organizer = players.find((player) => player.id === session.organizerId)
  const remainingSeats = getRemainingSeats(session)
  const state = getSessionDisplayState(session)
  const relation = getUserRelation(session, currentPlayerId)
  const pendingRequests = session.requests.filter(
    (request) => request.state === 'pending',
  ).length

  return (
    <article className="session-card">
      <div className={`game-art game-art--${session.tone}`} aria-hidden="true">
        <span>{getGameInitials(session.game)}</span>
      </div>
      <div className="session-card__body">
        <div className="session-card__heading">
          <h2>{session.game}</h2>
          {showRelation && (relation !== 'none' || state !== 'open') ? (
            <div className="session-card__states">
              {relation !== 'none' ? (
                <span className={`status-pill status-pill--${relation}`}>
                  {relationLabels[relation]}
                </span>
              ) : null}
              {state !== 'open' ? (
                <span className={`status-pill status-pill--${state}`}>
                  {stateLabels[state]}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <dl className="session-facts session-facts--compact">
          <div>
            <dt><span className="u-visually-hidden">Fecha y hora</span><AppIcon name="calendar" /></dt>
            <dd>{formatSessionDate(session.startsAt)} · {formatSessionTime(session.startsAt)}</dd>
          </div>
          <div>
            <dt><span className="u-visually-hidden">Ubicación aproximada</span><AppIcon name="location" /></dt>
            <dd>{session.zone} · Madrid</dd>
          </div>
          <div>
            <dt><span className="u-visually-hidden">Aforo</span><AppIcon name="people" /></dt>
            <dd>
              {session.participantIds.length}/{session.capacity} confirmados
              {state === 'open' ? ` · ${remainingSeats} ${remainingSeats === 1 ? 'plaza' : 'plazas'}` : ''}
            </dd>
          </div>
        </dl>

        <p className="session-card__organizer">
          Organiza <strong>{organizer?.displayName ?? 'Perfil no disponible'}</strong>
        </p>

        {relation === 'organizer' && pendingRequests > 0 ? (
          <p className="session-card__request-count">
            {pendingRequests} {pendingRequests === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
          </p>
        ) : null}

        {relation === 'not-confirmed' ? (
          <p className="session-card__capacity-note">
            La partida se completó antes de confirmar tu solicitud.
          </p>
        ) : null}

        <Link
          className="text-link session-card__link"
          state={{
            from: showRelation ? '/my-sessions' : '/',
            fromLabel: showRelation ? 'Mis partidas' : 'Explorar',
          }}
          to={`/sessions/${session.id}`}
        >
          {relation === 'organizer' ? 'Gestionar partida' : 'Ver partida'}
          <AppIcon name="arrow" size={18} />
          <span className="u-visually-hidden"> de {session.game}</span>
        </Link>
      </div>
    </article>
  )
}
