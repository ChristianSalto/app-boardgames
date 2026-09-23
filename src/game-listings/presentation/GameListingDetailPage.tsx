import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { usePrototype } from '../../app/PrototypeContext'
import type { GameListing } from '../domain/gameListing'
import type { ListingInterest, ListingInterestStatus } from '../domain/listingInterest'
import type { Player } from '../../players/types'
import { useGameListings } from './GameListingsProvider'
import { formatListingPrice, getListingConditionLabel } from './listingPresentation'

type DetailLocationState = Readonly<{ created?: boolean; edited?: boolean }>

export function GameListingDetailPage() {
  const { listingId } = useParams()
  const location = useLocation()
  const locationState = location.state as DetailLocationState | null
  const { currentPlayerId, getPlayer, players } = usePrototype()
  const {
    acceptInterest,
    closeListing,
    declineInterest,
    expressInterest,
    getInterest,
    getListing,
    getOwnerInterests,
  } = useGameListings()
  const [listing, setListing] = useState<GameListing | null>(null)
  const [interest, setInterest] = useState<ListingInterest | null>(null)
  const [ownerInterests, setOwnerInterests] = useState<readonly ListingInterest[]>([])
  const [interestedPlayers, setInterestedPlayers] = useState<Readonly<Record<string, Player>>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(
    locationState?.created ? 'Anuncio publicado correctamente.' : locationState?.edited ? 'Cambios guardados correctamente.' : '',
  )
  const [confirmingClose, setConfirmingClose] = useState(false)
  const [resolvingInterestId, setResolvingInterestId] = useState<string | null>(null)

  useEffect(() => {
    if (!listingId) return
    let mounted = true
    setLoading(true)
    Promise.all([
      getListing(listingId),
      getInterest(listingId),
    ]).then(async ([nextListing, nextInterest]) => {
      const nextOwnerInterests = nextListing?.ownerId === currentPlayerId
        ? await getOwnerInterests(listingId)
        : []
      const profiles = await Promise.all(nextOwnerInterests.map((item) => getPlayer(item.playerId)))
      if (!mounted) return
      setListing(nextListing)
      setInterest(nextInterest)
      setOwnerInterests(nextOwnerInterests)
      setInterestedPlayers(profiles.reduce<Readonly<Record<string, Player>>>((byId, player) => (
        player ? { ...byId, [player.id]: player } : byId
      ), {}))
    }).catch(() => {
      if (mounted) setListing(null)
    }).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [currentPlayerId, getInterest, getListing, getOwnerInterests, getPlayer, listingId])

  const owner = useMemo(
    () => players.find((player) => player.id === listing?.ownerId),
    [listing?.ownerId, players],
  )

  if (loading) return <section className="page-container page-section"><p className="listing-loading" aria-live="polite">Cargando anuncio…</p></section>

  if (!listing) {
    return <section className="page-container page-section"><div className="empty-state"><h1>Anuncio no encontrado</h1><p>Puede que el enlace no sea correcto o que el anuncio ya no esté disponible.</p><Link className="button button--primary" to="/listings">Ver Juegos de la comunidad</Link></div></section>
  }

  const isOwner = listing.ownerId === currentPlayerId
  const price = formatListingPrice(listing.price)
  const createdAt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(listing.createdAt))

  const handleInterest = async () => {
    const result = await expressInterest(listing.id)
    if (result.ok) {
      setInterest(result.value)
      setMessage('Has expresado tu interés. La persona propietaria podrá revisarlo de forma privada.')
      return
    }
    setMessage({
      'listing-not-found': 'El anuncio ya no está disponible.',
      'own-listing': 'No puedes interesarte por tu propio anuncio.',
      'listing-closed': 'El anuncio se ha cerrado y no admite nuevos intereses.',
      'interest-already-expressed': 'Ya has expresado interés por este anuncio.',
    }[result.error])
  }

  const handleClose = async () => {
    const result = await closeListing(listing.id)
    if (result.ok) {
      setListing(result.value)
      setConfirmingClose(false)
      setMessage('El anuncio se ha cerrado. Ya no aparecerá en descubrimiento.')
      return
    }
    setMessage('No se ha podido cerrar el anuncio. Inténtalo de nuevo.')
  }

  const handleResolveInterest = async (
    playerId: string,
    status: Extract<ListingInterestStatus, 'accepted' | 'declined'>,
  ) => {
    if (!listing) return
    setResolvingInterestId(playerId)
    try {
      const result = status === 'accepted'
        ? await acceptInterest(listing.id, playerId)
        : await declineInterest(listing.id, playerId)
      if (!result.ok) {
        setMessage('No hemos podido actualizar este interés. Inténtalo de nuevo.')
        return
      }
      setOwnerInterests((current) => current.map((item) => (
        item.playerId === playerId ? result.value : item
      )))
      setMessage(status === 'accepted'
        ? 'Has aceptado el interés. El juego sigue disponible hasta que decidas cerrarlo.'
        : 'Has rechazado el interés.')
    } finally {
      setResolvingInterestId(null)
    }
  }

  return (
    <section className="page-container listing-detail-page">
      <nav aria-label="Migas de pan" className="breadcrumb">
        <ol><li><Link to="/">Explorar</Link></li><li aria-current="page">{listing.gameName}</li></ol>
      </nav>
      {message ? <div className="feedback-banner" role="status"><span aria-hidden="true">✓</span><p>{message}</p></div> : null}

      <div className="listing-detail-layout">
        <div className="listing-detail-primary">
          <div className="listing-detail-heading">
            <div className="listing-card__meta">
              <span className={`listing-type listing-type--${listing.listingType}`}>{listing.listingType === 'sale' ? 'Venta' : 'Intercambio'}</span>
              <span className={`status-pill status-pill--listing-${listing.status}`}>{listing.status === 'active' ? 'Activo' : 'Cerrado'}</span>
            </div>
            <h1>{listing.gameName}</h1>
            <p>{listing.listingType === 'sale' ? price : 'Propone un intercambio con la persona propietaria.'}</p>
          </div>
          <img alt={`Imagen de ${listing.gameName}`} className="listing-detail-image" src={listing.imageUrl} />

          <dl className="listing-facts">
            <div><dt>Condición</dt><dd>{getListingConditionLabel(listing.condition)}</dd></div>
            <div><dt>Zona</dt><dd>{listing.city} · {listing.district}</dd></div>
            <div><dt>Publicado</dt><dd>{createdAt}</dd></div>
          </dl>
        </div>

        <aside className="listing-detail-aside" aria-label="Acciones del anuncio">
          {isOwner ? (
            <>
            <div className="participation-panel">
              <p className="eyebrow">Tu anuncio</p>
              <h2>{listing.status === 'active' ? 'Gestiona tu publicación' : 'Anuncio cerrado'}</h2>
              <p>{listing.status === 'active' ? 'Puedes actualizar la información o cerrarlo cuando deje de estar disponible.' : 'Permanece en tu historial, pero no se puede reabrir.'}</p>
              {listing.status === 'active' ? <div className="listing-owner-actions"><Link className="button button--secondary" to={`/listings/${listing.id}/edit`}>Editar anuncio</Link><button className="button button--danger" onClick={() => setConfirmingClose(true)} type="button">Cerrar anuncio</button></div> : null}
              {confirmingClose ? <div className="inline-confirm" role="group" aria-label="Confirmar cierre del anuncio"><p>¿Cerrar este anuncio? Dejará de aparecer en descubrimiento.</p><button className="button button--danger" onClick={() => void handleClose()} type="button">Sí, cerrar anuncio</button><button className="button button--ghost" onClick={() => setConfirmingClose(false)} type="button">Volver</button></div> : null}
              <ListingPrivacyNote />
            </div>
            <OwnerInterestPanel
              interests={ownerInterests}
              onResolve={handleResolveInterest}
              players={interestedPlayers}
              resolvingInterestId={resolvingInterestId}
            />
            </>
          ) : <InterestPanel interest={interest} listing={listing} onInterest={handleInterest} />}
        </aside>

        <div className="listing-detail-content">
          <section className="content-block">
            <h2>Sobre este juego</h2>
            <p>{listing.description}</p>
          </section>

          <section className="listing-owner content-block" aria-labelledby="listing-owner-title">
            <p className="eyebrow">Propietario</p>
            <h2 id="listing-owner-title">{owner?.displayName ?? 'Miembro de Mesa Abierta'}</h2>
            <p>{owner?.district ? `${owner.district} · Madrid` : 'Madrid'}</p>
            {owner ? <Link className="text-link" to={isOwner ? '/profile' : `/players/${owner.id}`}>Ver perfil <span aria-hidden="true">→</span></Link> : null}
          </section>
        </div>
      </div>
    </section>
  )
}

function InterestPanel({
  interest,
  listing,
  onInterest,
}: {
  readonly interest: ListingInterest | null
  readonly listing: GameListing
  readonly onInterest: () => Promise<void>
}) {
  if (listing.status === 'closed') return <div className="participation-panel participation-panel--muted"><p className="eyebrow">No disponible</p><h2>Este anuncio está cerrado</h2><p>Ya no admite nuevos intereses.</p><ListingPrivacyNote /></div>
  if (interest?.status === 'pending') return <div className="participation-panel participation-panel--pending"><p className="eyebrow">Tu interés</p><h2>Interés enviado</h2><p>Has mostrado interés. Pendiente de respuesta.</p><ListingPrivacyNote /></div>
  if (interest?.status === 'accepted') return <div className="participation-panel participation-panel--success"><p className="eyebrow">Interés aceptado</p><h2>Tu interés ha sido aceptado</h2><p>El propietario ha aceptado tu interés.</p><ListingPrivacyNote /></div>
  if (interest?.status === 'declined') return <div className="participation-panel participation-panel--muted"><p className="eyebrow">Interés no aceptado</p><h2>Esta vez no ha seguido adelante</h2><p>El propietario no ha aceptado tu interés.</p><ListingPrivacyNote /></div>

  return <div className="participation-panel"><p className="eyebrow">Anuncio activo</p><h2>¿Te interesa este juego?</h2><p>Envía una señal privada a la persona propietaria. No supone una reserva.</p><button className="button button--primary button--wide" onClick={() => void onInterest()} type="button">Me interesa</button><ListingPrivacyNote /></div>
}

function OwnerInterestPanel({
  interests,
  onResolve,
  players,
  resolvingInterestId,
}: {
  readonly interests: readonly ListingInterest[]
  readonly onResolve: (playerId: string, status: Extract<ListingInterestStatus, 'accepted' | 'declined'>) => Promise<void>
  readonly players: Readonly<Record<string, Player>>
  readonly resolvingInterestId: string | null
}) {
  return (
    <section className="content-block requests-block" aria-labelledby="listing-interests-title">
      <h2 id="listing-interests-title">Personas interesadas</h2>
      {interests.length === 0 ? <p className="inline-empty">No hay personas interesadas todavía.</p> : (
        <ul className="request-list">
          {interests.map((item) => {
            const isResolving = resolvingInterestId === item.playerId
            return <li className="request-card" key={item.playerId}>
              <strong>{players[item.playerId]?.displayName ?? 'Miembro de Mesa Abierta'}</strong>
              <p>Estado: {interestStatusLabel(item.status)}</p>
              {item.status === 'pending' ? <div className="request-card__actions">
                <button className="button button--primary" disabled={isResolving} onClick={() => void onResolve(item.playerId, 'accepted')} type="button">Aceptar</button>
                <button className="button button--secondary" disabled={isResolving} onClick={() => void onResolve(item.playerId, 'declined')} type="button">Rechazar</button>
              </div> : null}
            </li>
          })}
        </ul>
      )}
    </section>
  )
}

const interestStatusLabel = (status: ListingInterestStatus) => ({
  pending: 'Pendiente',
  accepted: 'Aceptado',
  declined: 'Rechazado',
}[status])

function ListingPrivacyNote() {
  return <p className="listing-privacy-note">No se muestran teléfonos ni emails. Un interés no reserva el juego ni completa una operación.</p>
}
