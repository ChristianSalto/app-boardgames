import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { PlayerReputationSignal } from '../player-trust/presentation/PlayerReputationSignal'
import { ReviewParticipantsAction } from '../player-trust/presentation/ReviewParticipantsAction'
import { AppIcon } from '../shared/AppIcon'
import { SessionLoadErrorState } from './SessionLoadErrorState'
import {
  formatSessionDate,
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

const mobileRequestBatchSize = 3

const isOutdatedActionMessage = (
  message: string,
  relation: ReturnType<typeof getUserRelation>,
  state: ReturnType<typeof getSessionDisplayState>,
) => (
  (message.startsWith('Solicitud enviada.')
    && (relation === 'confirmed' || relation === 'declined' || relation === 'not-confirmed' || state === 'cancelled'))
  || (state === 'cancelled' && message.includes('tiene plaza confirmada'))
)

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
    readonly fromKey?: string
  } | null
  const navigate = useNavigate()
  const {
    acceptRequest,
    cancelSession,
    currentPlayerId,
    declineRequest,
    getPlayer,
    playerLoadStates,
    players,
    requestSeat,
    retrySessions,
    sessions,
    sessionsError,
    sessionsLoading,
  } = usePrototype()
  const [confirmingDecline, setConfirmingDecline] = useState<string | null>(null)
  const [confirmingCancellation, setConfirmingCancellation] = useState(false)
  const managementHeadingRef = useRef<HTMLHeadingElement>(null)
  const requestsHadFocusRef = useRef(false)
  const [actionMessage, setActionMessage] = useState(
    locationState?.created ? 'Partida publicada correctamente.' : locationState?.edited ? 'Cambios guardados correctamente.' : '',
  )

  const session = sessions.find((item) => item.id === sessionId)
  const pendingCount = session?.requests.filter((request) => request.status === 'pending').length ?? 0

  useEffect(() => {
    if (pendingCount !== 0 || session?.organizerId !== currentPlayerId || !requestsHadFocusRef.current) return
    if (document.activeElement === document.body) managementHeadingRef.current?.focus()
    requestsHadFocusRef.current = false
  }, [currentPlayerId, pendingCount, session?.organizerId])

  useEffect(() => {
    if (!session || !actionMessage) return
    const relation = getUserRelation(session, currentPlayerId)
    const state = getSessionDisplayState(session)
    if (isOutdatedActionMessage(actionMessage, relation, state)) setActionMessage('')
  }, [actionMessage, currentPlayerId, session])

  const playerById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  )

  if (sessionsLoading && !sessionsError) {
    return <main className="auth-state" aria-live="polite"><p>Cargando partida…</p></main>
  }

  if (sessionsError) {
    return (
      <section className="page-container page-section">
        <SessionLoadErrorState
          loading={sessionsLoading}
          title="No hemos podido cargar esta partida"
          message="Comprueba tu conexión e inténtalo de nuevo."
          onRetry={() => { void retrySessions() }}
        />
        <Link className="text-link" to="/">Volver a Explorar</Link>
      </section>
    )
  }

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

  const participants = session.participantIds.map((id) => ({ id, player: playerById.get(id) }))
  const pendingRequests = session.requests.filter((request) => request.status === 'pending')
  const relation = getUserRelation(session, currentPlayerId)
  const displayState = getSessionDisplayState(session)
  const visibleActionMessage = isOutdatedActionMessage(actionMessage, relation, displayState) ? '' : actionMessage
  const remainingSeats = getRemainingSeats(session)
  const isOrganizer = relation === 'organizer'
  const originPath = locationState?.from ?? '/'
  const originLabel = locationState?.fromLabel ?? 'Explorar'
  const returnedFromExplore =
    locationState?.from?.split('?')[0] === '/' && Boolean(locationState.fromKey)
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
      if (pendingRequests.length === 1) {
        managementHeadingRef.current?.focus()
      }
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
      if (pendingRequests.length === 1) {
        managementHeadingRef.current?.focus()
      }
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

  const participationAside = (
    <aside
      aria-label={isOrganizer ? 'Gestión de la partida' : 'Estado de tu participación'}
      className="detail-aside"
    >
      {isOrganizer ? (
        <div className="participation-panel organizer-management">
          <h2 ref={managementHeadingRef} tabIndex={-1}>{displayState === 'cancelled' ? 'Tu partida' : 'Gestionar partida'}</h2>
          <p aria-live="polite" className={`organizer-management__pending${pendingRequests.length > 0 ? ' organizer-management__pending--active' : ''}`}>
            {pendingRequests.length === 0 ? 'No tienes solicitudes pendientes.' : (
              <>{pendingRequests.length} {pendingRequests.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}</>
            )}
          </p>
          {displayState !== 'cancelled' && pendingRequests.length > 0 ? (
            <div
              className="organizer-management__requests"
              onFocusCapture={() => { requestsHadFocusRef.current = true }}
            >
              <OrganizerRequests
                key={`${currentPlayerId}:${session.id}`}
                confirmingDecline={confirmingDecline}
                managementHeadingRef={managementHeadingRef}
                onAccept={handleAccept}
                onCancelDecline={() => setConfirmingDecline(null)}
                onConfirmDecline={handleDecline}
                onRetryPlayer={getPlayer}
                onStartDecline={setConfirmingDecline}
                pendingRequests={pendingRequests.map((request) => ({
                  playerId: request.playerId,
                  player: playerById.get(request.playerId),
                }))}
                playerLoadStates={playerLoadStates}
                profileNavigationState={profileNavigationState}
              />
            </div>
          ) : null}
          {displayState !== 'cancelled' ? (
            <section aria-labelledby="organizer-session-actions-title" className="detail-organizer-actions">
              <h3 id="organizer-session-actions-title">Gestión de la partida</h3>
              <Link className="button button--ghost" to={`/sessions/${session.id}/edit`}>Editar partida</Link>
              <button
                className="button detail-organizer-actions__cancel"
                onClick={() => setConfirmingCancellation(true)}
                type="button"
              >
                Cancelar partida
              </button>
            </section>
          ) : null}
          {confirmingCancellation ? (
            <div className="inline-confirm" role="group" aria-label="Confirmar cancelación de la partida">
              <p>¿Cancelar esta partida? Las solicitudes pendientes dejarán de estar activas.</p>
              <button className="button button--danger" onClick={handleCancel} type="button">Sí, cancelar partida</button>
              <button className="button button--ghost" onClick={() => setConfirmingCancellation(false)} type="button">Volver</button>
            </div>
          ) : null}
        </div>
      ) : (
        <ParticipationPanel
          displayState={displayState}
          onRequest={handleRequest}
          relation={relation}
          remainingSeats={remainingSeats}
        />
      )}
    </aside>
  )

  return (
    <section className="page-container detail-page">
      <nav aria-label="Migas de pan" className="breadcrumb">
        <ol>
          <li>
            <Link
              onClick={(event) => {
                if (
                  !returnedFromExplore
                  || event.button !== 0
                  || event.metaKey
                  || event.altKey
                  || event.ctrlKey
                  || event.shiftKey
                ) return
                event.preventDefault()
                navigate(-1)
              }}
              to={originPath}
            >
              {originLabel}
            </Link>
          </li>
          <li aria-current="page">{session.game}</li>
        </ol>
      </nav>

      {visibleActionMessage ? (
        <div className="feedback-banner" role="status" tabIndex={-1}>
          <span aria-hidden="true">✓</span>
          <p>{visibleActionMessage}</p>
        </div>
      ) : null}

      <div className="detail-layout">
        <section className="session-overview-card" aria-labelledby="session-detail-title">
            <div className="detail-heading">
              <div className={`game-art game-art--large game-art--${session.tone}`} aria-hidden="true">
                <span>{getGameInitials(session.game)}</span>
              </div>
              <div className="detail-heading__content">
                <p className="detail-context">
                  {isOrganizer ? 'Gestionar partida' : 'Detalle de partida'}
                </p>
                <div className="detail-heading__meta">
                  <span className={`status-pill status-pill--${displayState}`}>
                    {stateLabels[displayState]}
                  </span>
                  {isOrganizer ? <span className="status-pill status-pill--organizer">Organizada por ti</span> : null}
                </div>
                <h1 id="session-detail-title">{session.game}</h1>
                <p className="detail-heading__summary">Encuentro de juegos de mesa.</p>
              </div>
            </div>

            <dl className="detail-facts">
              <div>
                <dt><AppIcon name="calendar" size={18} /><span>Cuándo</span></dt>
                <dd className="u-capitalize">
                  <span className="detail-date-long">{formatSessionLongDate(session.startsAt)}</span>
                  <span className="detail-date-compact">{formatSessionDate(session.startsAt)}</span>
                  {' · '}{formatSessionTime(session.startsAt)}
                </dd>
              </div>
              <div>
                <dt><AppIcon name="location" size={18} /><span>Dónde</span></dt>
                <dd className="detail-location">
                  <strong>{session.place || 'Lugar por confirmar'}</strong>
                  <span>{session.zone} · Madrid</span>
                  <small>El lugar es simulado. La visibilidad de una dirección real exacta dependerá de criterios de privacidad.</small>
                </dd>
              </div>
              <div>
                <dt><AppIcon name="people" size={18} /><span>Aforo</span></dt>
                <dd>{session.participantIds.length}/{session.capacity} confirmados · {remainingSeats} {remainingSeats === 1 ? 'plaza' : 'plazas'}</dd>
              </div>
            </dl>
        </section>

        {participationAside}

        <div className="detail-main">

          <div className="content-block" id="session-management" tabIndex={-1}>
            <div className="content-block__heading">
              <h2>Participantes confirmados</h2>
              <span>{session.participantIds.length}/{session.capacity}</span>
            </div>
            <ul className="people-list">
              {participants.map(({ id, player }) => (
                <li key={id}>
                  {player ? (
                    <Link
                      className="person-row"
                      state={id === currentPlayerId ? undefined : profileNavigationState}
                      to={id === currentPlayerId ? '/profile' : `/players/${id}`}
                    >
                      <span className="avatar" aria-hidden="true">{getInitials(player.displayName)}</span>
                      <span>
                        <strong>{player.displayName}</strong>
                        <small>{id === session.organizerId ? 'Organiza la partida' : player.district ?? 'Madrid'}</small>
                        {id === session.organizerId ? <PlayerReputationSignal playerId={id} /> : null}
                      </span>
                      <AppIcon name="arrow" size={18} />
                    </Link>
                  ) : (
                    <div className="person-row">
                      <span className="avatar" aria-hidden="true">?</span>
                      <span>
                        <strong>{id === session.organizerId ? 'Persona organizadora' : 'Participante confirmado'}</strong>
                        <small>{id === session.organizerId ? 'Organiza la partida' : 'Plaza confirmada'}</small>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <section className="session-description-block" aria-labelledby="session-description-title">
            <h2 id="session-description-title">Sobre la partida</h2>
            <p>{session.description || 'El organizador no ha añadido información adicional.'}</p>
          </section>

          <ReviewParticipantsAction sessionId={session.id} />

        </div>
      </div>
    </section>
  )
}

type ParticipationPanelProps = {
  readonly displayState: ReturnType<typeof getSessionDisplayState>
  readonly onRequest: () => Promise<void>
  readonly relation: ReturnType<typeof getUserRelation>
  readonly remainingSeats: number
}

function ParticipationPanel({
  displayState,
  onRequest,
  relation,
  remainingSeats,
}: ParticipationPanelProps) {
  if (displayState === 'cancelled') {
    return <div className="participation-panel participation-panel--muted"><p className="eyebrow">Cancelada</p><h2>La partida ha sido cancelada</h2><p>No admite nuevas solicitudes.</p></div>
  }

  if (displayState === 'past') {
    return <div className="participation-panel participation-panel--muted"><p className="eyebrow">Pasada</p><h2>Esta partida ya se celebró</h2><p>Puedes conservarla como referencia en Mis partidas.</p></div>
  }

  if (relation === 'confirmed') {
    return <div className="participation-panel participation-panel--success"><p className="eyebrow">Tu plaza</p><h2>Plaza confirmada</h2><p>Cuentas dentro del aforo.</p></div>
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
  readonly managementHeadingRef: RefObject<HTMLHeadingElement | null>
  readonly onAccept: (playerId: string) => Promise<void>
  readonly onCancelDecline: () => void
  readonly onConfirmDecline: (playerId: string) => Promise<void>
  readonly onRetryPlayer: ReturnType<typeof usePrototype>['getPlayer']
  readonly onStartDecline: (playerId: string) => void
  readonly pendingRequests: readonly {
    readonly playerId: string
    readonly player: ReturnType<Map<string, ReturnType<typeof usePrototype>['players'][number]>['get']>
  }[]
  readonly playerLoadStates: ReturnType<typeof usePrototype>['playerLoadStates']
  readonly profileNavigationState: ProfileNavigationState
}

function OrganizerRequests({
  confirmingDecline,
  managementHeadingRef,
  onAccept,
  onCancelDecline,
  onConfirmDecline,
  onRetryPlayer,
  onStartDecline,
  pendingRequests,
  playerLoadStates,
  profileNavigationState,
}: OrganizerRequestsProps) {
  const [retryingProfiles, setRetryingProfiles] = useState<ReadonlySet<string>>(() => new Set())
  const [profileErrors, setProfileErrors] = useState<ReadonlySet<string>>(() => new Set())
  const [visibleCount, setVisibleCount] = useState(mobileRequestBatchSize)
  const remainingCount = Math.max(0, pendingRequests.length - visibleCount)
  const moreHadFocusRef = useRef(false)

  useEffect(() => {
    const lastBatch = Math.max(mobileRequestBatchSize,
      Math.ceil(pendingRequests.length / mobileRequestBatchSize) * mobileRequestBatchSize)
    setVisibleCount((current) => Math.min(current, lastBatch))
  }, [pendingRequests.length])

  useEffect(() => {
    if (pendingRequests.length > mobileRequestBatchSize || !moreHadFocusRef.current) return
    moreHadFocusRef.current = false
    if (document.activeElement === document.body) managementHeadingRef.current?.focus()
  }, [managementHeadingRef, pendingRequests.length])

  const retryProfile = async (playerId: string) => {
    setRetryingProfiles((current) => new Set(current).add(playerId))
    setProfileErrors((current) => {
      const next = new Set(current)
      next.delete(playerId)
      return next
    })
    try {
      if (!await onRetryPlayer(playerId)) {
        setProfileErrors((current) => new Set(current).add(playerId))
      }
    } catch {
      setProfileErrors((current) => new Set(current).add(playerId))
    } finally {
      setRetryingProfiles((current) => {
        const next = new Set(current)
        next.delete(playerId)
        return next
      })
    }
  }

  return (
    <>
    <ul aria-label="Solicitudes pendientes" className="request-list">
      {pendingRequests.map(({ playerId, player }, index) => (
        <li className={`request-card${index >= visibleCount ? ' request-card--mobile-hidden' : ''}`} key={playerId}>
          <div className="person-row person-row--static">
            <span className="avatar" aria-hidden="true">{getInitials(player?.displayName ?? '?')}</span>
            <span>
              <strong>{player?.displayName ?? 'Persona solicitante'}</strong>
              <small>{player?.district ? `${player.district} · Madrid` : 'Madrid'}</small>
            </span>
            {player ? (
              <Link
                aria-label={`Ver perfil de ${player.displayName}`}
                className="text-link"
                state={profileNavigationState}
                to={`/players/${playerId}`}
              >
                Ver perfil
              </Link>
            ) : null}
          </div>
          {player ? <div className="request-card__reputation"><PlayerReputationSignal playerId={playerId} showNoReviews /></div> : null}
          {player?.description ? <p className="request-card__bio"><span>Descripción del perfil:</span> {player.description}</p> : null}
          {!player ? (
            <>
              <p role="status">
                {retryingProfiles.has(playerId)
                  ? 'Cargando perfil…'
                  : profileErrors.has(playerId) || playerLoadStates[playerId] === 'error'
                    ? 'No hemos podido cargar este perfil. Inténtalo de nuevo.'
                    : playerLoadStates[playerId] === 'missing'
                      ? 'Este perfil no está disponible. Reintenta antes de responder.'
                      : 'El perfil aún no se muestra. Espera o reintenta para identificar a esta persona antes de responder.'}
              </p>
              <div className="request-card__actions">
                <button
                  className="button button--ghost"
                  disabled={retryingProfiles.has(playerId)}
                  onClick={() => { void retryProfile(playerId) }}
                  type="button"
                >
                  Reintentar carga del perfil
                </button>
              </div>
            </>
          ) : confirmingDecline === playerId ? (
            <div className="inline-confirm" role="group" aria-label={`Confirmar rechazo de ${player?.displayName ?? 'la solicitud'}`}>
              <p>¿Rechazar esta solicitud?</p>
              <button className="button button--danger" onClick={() => onConfirmDecline(playerId)} type="button">Sí, rechazar</button>
              <button className="button button--ghost" onClick={onCancelDecline} type="button">Volver</button>
            </div>
          ) : (
            <div className="request-card__actions">
              <button aria-label={`Aceptar solicitud de ${player.displayName}`} className="button button--primary" onClick={() => onAccept(playerId)} type="button">Aceptar solicitud</button>
              <button aria-label={`Rechazar solicitud de ${player.displayName}`} className="button button--ghost" onClick={() => onStartDecline(playerId)} type="button">Rechazar</button>
            </div>
          )}
        </li>
      ))}
    </ul>
    {pendingRequests.length > mobileRequestBatchSize ? (
      <button
        className="button button--ghost organizer-management__more"
        onFocus={() => { moreHadFocusRef.current = true }}
        onClick={() => setVisibleCount((current) => remainingCount > 0 ? current + mobileRequestBatchSize : mobileRequestBatchSize)}
        type="button"
      >
        {remainingCount > 0
          ? `Ver ${remainingCount} ${remainingCount === 1 ? 'solicitud' : 'solicitudes'} más`
          : 'Mostrar menos'}
      </button>
    ) : null}
    </>
  )
}

const getInitials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
