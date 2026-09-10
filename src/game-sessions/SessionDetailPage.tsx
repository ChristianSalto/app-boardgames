import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { AppIcon } from '../shared/AppIcon'
import {
  formatSessionLongDate,
  formatSessionTime,
  getGameInitials,
  getRemainingSeats,
  getSessionDisplayState,
  getUserRelation,
} from './model'

const stateLabels = {
  open: 'Abierta',
  complete: 'Completa',
  cancelled: 'Cancelada',
  past: 'Pasada',
} as const

type ProfileNavigationState = {
  readonly from: string
  readonly fromLabel: string
  readonly rootFrom: string
  readonly rootLabel: string
}

export function SessionDetailPage() {
  const { sessionId } = useParams()
  const location = useLocation()
  const locationState = location.state as {
    readonly created?: boolean
    readonly edited?: boolean
    readonly from?: string
    readonly fromLabel?: string
  } | null
  const {
    acceptRequest,
    cancelSession,
    currentPlayerId,
    declineRequest,
    players,
    requestSeat,
    sessions,
  } = usePrototype()
  const [confirmingDecline, setConfirmingDecline] = useState<string | null>(null)
  const [confirmingCancellation, setConfirmingCancellation] = useState(false)
  const [actionMessage, setActionMessage] = useState(
    locationState?.created ? 'Partida publicada correctamente.' : locationState?.edited ? 'Cambios guardados correctamente.' : '',
  )

  const session = sessions.find((item) => item.id === sessionId)

  const playerById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  )

  if (!session) {
    return (
      <section className="page-container page-section">
        <div className="empty-state">
          <h1>Partida no encontrada</h1>
          <p>Puede que el enlace no sea correcto o que la partida ya no esté disponible.</p>
          <Link className="button button--primary" to="/">Volver a Explorar</Link>
        </div>
      </section>
    )
  }

  const organizer = playerById.get(session.organizerId)
  const participants = session.participantIds
    .map((id) => playerById.get(id))
    .filter((player) => player !== undefined)
  const pendingRequests = session.requests.filter((request) => request.status === 'pending')
  const relation = getUserRelation(session, currentPlayerId)
  const displayState = getSessionDisplayState(session)
  const remainingSeats = getRemainingSeats(session)
  const isOrganizer = relation === 'organizer'
  const originPath = locationState?.from ?? (isOrganizer ? '/my-sessions' : '/')
  const originLabel = locationState?.fromLabel ?? (isOrganizer ? 'Mis partidas' : 'Explorar')
  const profileNavigationState = {
    from: location.pathname,
    fromLabel: session.game,
    rootFrom: originPath,
    rootLabel: originLabel,
  }

  const handleRequest = async () => {
    try {
      await requestSeat(session.id)
      setActionMessage(
        'Solicitud enviada. Está pendiente de respuesta; aún no tienes una plaza confirmada.',
      )
    } catch {
      setActionMessage('No se ha podido enviar la solicitud. Comprueba que la partida siga disponible.')
    }
  }

  const handleAccept = async (playerId: string) => {
    const player = playerById.get(playerId)
    const willComplete = remainingSeats === 1
    const requestsClosed = willComplete ? Math.max(0, pendingRequests.length - 1) : 0
    try {
      await acceptRequest(session.id, playerId)
      setConfirmingDecline(null)
      setActionMessage(
        willComplete
          ? `${player?.displayName ?? 'La persona'} tiene plaza confirmada. La partida está completa${requestsClosed > 0 ? ` y ${requestsClosed} ${requestsClosed === 1 ? 'solicitud restante se ha cerrado' : 'solicitudes restantes se han cerrado'} por falta de plazas` : ''}.`
          : `${player?.displayName ?? 'La persona'} tiene ahora una plaza confirmada.`,
      )
    } catch {
      setActionMessage('No se ha podido aceptar la solicitud. La partida puede haberse completado.')
    }
  }

  const handleDecline = async (playerId: string) => {
    const player = playerById.get(playerId)
    try {
      await declineRequest(session.id, playerId)
      setConfirmingDecline(null)
      setActionMessage(`La solicitud de ${player?.displayName ?? 'esta persona'} no ha sido aceptada.`)
    } catch {
      setActionMessage('No se ha podido rechazar la solicitud. Inténtalo de nuevo.')
    }
  }

  const handleCancel = async () => {
    try {
      await cancelSession(session.id)
      setConfirmingCancellation(false)
      setActionMessage('La partida se ha cancelado. Ya no admite solicitudes.')
    } catch {
      setActionMessage('No se ha podido cancelar la partida. Inténtalo de nuevo.')
    }
  }

  return (
    <section className="page-container detail-page">
      <nav aria-label="Migas de pan" className="breadcrumb">
        <ol>
          <li><Link to={originPath}>{originLabel}</Link></li>
          <li aria-current="page">{session.game}</li>
        </ol>
      </nav>

      {actionMessage ? (
        <div className="feedback-banner" role="status" tabIndex={-1}>
          <span aria-hidden="true">✓</span>
          <p>{actionMessage}</p>
        </div>
      ) : null}

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-heading">
            <div className={`game-art game-art--large game-art--${session.tone}`} aria-hidden="true">
              <span>{getGameInitials(session.game)}</span>
            </div>
            <div>
              <p className="detail-context">
                {isOrganizer ? 'Gestionar partida' : 'Detalle de partida'}
              </p>
              <div className="detail-heading__meta">
                <span className={`status-pill status-pill--${displayState}`}>
                  {stateLabels[displayState]}
                </span>
                {isOrganizer ? <span className="status-pill status-pill--organizer">Organizada por ti</span> : null}
              </div>
              <h1>{session.game}</h1>
              <p>Encuentro de juegos de mesa en {session.zone}.</p>
              {isOrganizer && displayState !== 'cancelled' ? (
                <div className="request-card__actions">
                  <Link className="button button--ghost" to={`/sessions/${session.id}/edit`}>Editar partida</Link>
                  <button className="button button--danger" onClick={() => setConfirmingCancellation(true)} type="button">Cancelar partida</button>
                </div>
              ) : null}
              {isOrganizer && confirmingCancellation ? (
                <div className="inline-confirm" role="group" aria-label="Confirmar cancelación de la partida">
                  <p>¿Cancelar esta partida? Las solicitudes pendientes dejarán de estar activas.</p>
                  <button className="button button--danger" onClick={handleCancel} type="button">Sí, cancelar partida</button>
                  <button className="button button--ghost" onClick={() => setConfirmingCancellation(false)} type="button">Volver</button>
                </div>
              ) : null}
            </div>
          </div>

          <dl className="detail-facts">
            <div>
              <dt><AppIcon name="calendar" /> Cuándo</dt>
              <dd className="u-capitalize">{formatSessionLongDate(session.startsAt)} · {formatSessionTime(session.startsAt)}</dd>
            </div>
            <div>
              <dt><AppIcon name="location" /> Dónde</dt>
              <dd className="detail-location">
                <strong>{session.place || 'Lugar por confirmar'}</strong>
                <span>{session.zone} · Madrid</span>
              </dd>
            </div>
            <div>
              <dt><AppIcon name="people" /> Aforo</dt>
              <dd>{session.participantIds.length}/{session.capacity} confirmados · {remainingSeats} {remainingSeats === 1 ? 'plaza' : 'plazas'}</dd>
            </div>
          </dl>

          {organizer ? (
            <section className="organizer-trust" aria-labelledby="organizer-title">
              <div className="organizer-trust__identity">
                <span className="avatar" aria-hidden="true">{getInitials(organizer.displayName)}</span>
                <div>
                  <h2 id="organizer-title">{organizer.displayName}</h2>
                  <p>Organiza esta partida</p>
                </div>
              </div>
              <div className="organizer-trust__content">
                {organizer.trust ? (
                <dl className="organizer-trust__signals">
                  <div>
                    <dt>Reputación</dt>
                    <dd>{formatRating(organizer.trust.averageRating)} <span aria-hidden="true">★</span> · {organizer.trust.ratingCount} valoraciones</dd>
                  </div>
                  <div>
                    <dt>Fiabilidad</dt>
                    <dd>{organizer.trust.attendedGames}/{organizer.trust.gamesPlayed} asistencias · {organizer.trust.noShows} {organizer.trust.noShows === 1 ? 'ausencia' : 'ausencias'} sin aviso</dd>
                  </div>
                </dl>
                ) : <p>Las señales de confianza aún no están disponibles para este perfil.</p>}
                <Link
                  className="text-link"
                  state={organizer.id === currentPlayerId ? undefined : profileNavigationState}
                  to={organizer.id === currentPlayerId ? '/profile' : `/players/${organizer.id}`}
                >
                  Ver perfil y opiniones <AppIcon name="arrow" size={17} />
                </Link>
              </div>
            </section>
          ) : null}

          <div className="content-block">
            <h2>Sobre la partida</h2>
            <p>{session.description || 'El organizador no ha añadido información adicional.'}</p>
          </div>

          <div className="content-block">
            <div className="content-block__heading">
              <h2>Participantes confirmados</h2>
              <span>{participants.length}/{session.capacity}</span>
            </div>
            <ul className="people-list">
              {participants.map((player) => (
                <li key={player.id}>
                  <Link
                    className="person-row"
                    state={player.id === currentPlayerId ? undefined : profileNavigationState}
                    to={player.id === currentPlayerId ? '/profile' : `/players/${player.id}`}
                  >
                    <span className="avatar" aria-hidden="true">{getInitials(player.displayName)}</span>
                    <span>
                      <strong>{player.displayName}</strong>
                      <small>{player.id === session.organizerId ? 'Organiza la partida' : player.district ?? 'Madrid'}</small>
                    </span>
                    <AppIcon name="arrow" size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {isOrganizer && displayState !== 'cancelled' ? (
            <OrganizerRequests
              confirmingDecline={confirmingDecline}
              onAccept={handleAccept}
              onCancelDecline={() => setConfirmingDecline(null)}
              onConfirmDecline={handleDecline}
              onStartDecline={setConfirmingDecline}
              pendingRequests={pendingRequests.map((request) => ({
                playerId: request.playerId,
                player: playerById.get(request.playerId),
              }))}
              profileNavigationState={profileNavigationState}
              sessionIsComplete={displayState === 'complete'}
            />
          ) : null}
        </div>

        <aside className="detail-aside" aria-label="Estado de tu participación">
          <ParticipationPanel
            displayState={displayState}
            isOrganizer={isOrganizer}
            onRequest={handleRequest}
            relation={relation}
            remainingSeats={remainingSeats}
          />
          <p className="privacy-note">
            <AppIcon name="location" size={18} />
            El lugar mostrado es simulado. La visibilidad de una dirección exacta real se decidirá con criterios de privacidad.
          </p>
        </aside>
      </div>
    </section>
  )
}

type ParticipationPanelProps = {
  readonly displayState: ReturnType<typeof getSessionDisplayState>
  readonly isOrganizer: boolean
  readonly onRequest: () => Promise<void>
  readonly relation: ReturnType<typeof getUserRelation>
  readonly remainingSeats: number
}

function ParticipationPanel({
  displayState,
  isOrganizer,
  onRequest,
  relation,
  remainingSeats,
}: ParticipationPanelProps) {
  if (isOrganizer) {
    return <div className="participation-panel"><p className="eyebrow">Tu partida</p><h2>Gestiona esta mesa</h2><p>Revisa participantes y solicitudes desde esta misma pantalla.</p></div>
  }

  if (displayState === 'cancelled') {
    return <div className="participation-panel participation-panel--muted"><p className="eyebrow">Cancelada</p><h2>La partida ha sido cancelada</h2><p>No admite nuevas solicitudes.</p></div>
  }

  if (displayState === 'past') {
    return <div className="participation-panel participation-panel--muted"><p className="eyebrow">Pasada</p><h2>Esta partida ya se celebró</h2><p>Puedes conservarla como referencia en Mis partidas.</p></div>
  }

  if (relation === 'confirmed') {
    return <div className="participation-panel participation-panel--success"><p className="eyebrow">Tu plaza</p><h2>Participación confirmada</h2><p>Ya cuentas dentro del aforo de esta partida.</p></div>
  }

  if (relation === 'pending') {
    return <div className="participation-panel participation-panel--pending"><p className="eyebrow">Tu solicitud</p><h2>Solicitud pendiente</h2><p>Aún no tienes una plaza confirmada. El organizador debe aceptar tu solicitud.</p><Link className="text-link" to="/my-sessions">Ver en Mis partidas <AppIcon name="arrow" size={17} /></Link></div>
  }

  if (relation === 'not-confirmed') {
    return <div className="participation-panel participation-panel--muted"><p className="eyebrow">Sin plaza confirmada</p><h2>La partida se ha completado</h2><p>Tu solicitud no llegó a confirmarse porque ya no quedan plazas.</p><Link className="text-link" to="/my-sessions">Ver en Mis partidas <AppIcon name="arrow" size={17} /></Link></div>
  }

  if (relation === 'declined') {
    return <div className="participation-panel participation-panel--muted"><p className="eyebrow">Tu solicitud</p><h2>Solicitud no aceptada</h2><p>Esta vez el organizador no ha confirmado tu participación.</p></div>
  }

  if (displayState === 'complete') {
    return <div className="participation-panel participation-panel--muted"><p className="eyebrow">Aforo completo</p><h2>No quedan plazas</h2><p>Esta partida ya tiene todas sus plazas confirmadas.</p></div>
  }

  return (
    <div className="participation-panel">
      <p className="eyebrow">{remainingSeats} {remainingSeats === 1 ? 'plaza disponible' : 'plazas disponibles'}</p>
      <h2>¿Te apetece jugar?</h2>
      <p>Tu solicitud deberá ser aceptada por el organizador.</p>
      <button className="button button--primary button--wide" onClick={onRequest} type="button">
        Solicitar plaza
      </button>
    </div>
  )
}

type OrganizerRequestsProps = {
  readonly confirmingDecline: string | null
  readonly onAccept: (playerId: string) => Promise<void>
  readonly onCancelDecline: () => void
  readonly onConfirmDecline: (playerId: string) => Promise<void>
  readonly onStartDecline: (playerId: string) => void
  readonly pendingRequests: readonly {
    readonly playerId: string
    readonly player: ReturnType<Map<string, ReturnType<typeof usePrototype>['players'][number]>['get']>
  }[]
  readonly profileNavigationState: ProfileNavigationState
  readonly sessionIsComplete: boolean
}

function OrganizerRequests({
  confirmingDecline,
  onAccept,
  onCancelDecline,
  onConfirmDecline,
  onStartDecline,
  pendingRequests,
  profileNavigationState,
  sessionIsComplete,
}: OrganizerRequestsProps) {
  return (
    <div className="content-block requests-block">
      <div className="content-block__heading">
        <div>
          <p className="eyebrow">Solo para ti</p>
          <h2>Solicitudes pendientes</h2>
        </div>
        <span>{pendingRequests.length}</span>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="inline-empty">
          <p>{sessionIsComplete ? 'La partida está completa. No quedan solicitudes pendientes.' : 'No tienes solicitudes pendientes.'}</p>
        </div>
      ) : (
        <ul className="request-list">
          {pendingRequests.map(({ playerId, player }) => (
            <li className="request-card" key={playerId}>
              <div className="person-row person-row--static">
                <span className="avatar" aria-hidden="true">{getInitials(player?.displayName ?? '?')}</span>
                <span>
                  <strong>{player?.displayName ?? 'Perfil no disponible'}</strong>
                  <small>{player?.district ? `${player.district} · Madrid` : 'Madrid'}</small>
                </span>
                <Link
                  className="text-link"
                  state={profileNavigationState}
                  to={`/players/${playerId}`}
                >
                  Ver perfil
                </Link>
              </div>
              {player?.description ? <p>{player.description}</p> : null}
              {confirmingDecline === playerId ? (
                <div className="inline-confirm" role="group" aria-label={`Confirmar rechazo de ${player?.displayName ?? 'la solicitud'}`}>
                  <p>¿Rechazar esta solicitud?</p>
                  <button className="button button--danger" onClick={() => onConfirmDecline(playerId)} type="button">Sí, rechazar</button>
                  <button className="button button--ghost" onClick={onCancelDecline} type="button">Volver</button>
                </div>
              ) : (
                <div className="request-card__actions">
                  <button className="button button--primary" onClick={() => onAccept(playerId)} type="button">Aceptar solicitud</button>
                  <button className="button button--ghost" onClick={() => onStartDecline(playerId)} type="button">Rechazar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const getInitials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')

const formatRating = (rating: number) => rating.toLocaleString('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
