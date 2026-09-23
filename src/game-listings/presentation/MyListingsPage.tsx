import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GameListing, GameListingId } from '../domain/gameListing'
import { GameListingCard } from './GameListingCard'
import { useGameListings } from './GameListingsProvider'

type InterestCounts = Readonly<Record<GameListingId, number>>

export function MyListingsPage() {
  const { closeListing, getOwnerInterests, loadError, loading, ownListings } = useGameListings()
  const [interestCounts, setInterestCounts] = useState<InterestCounts>({})
  const [confirmingListingId, setConfirmingListingId] = useState<GameListingId | null>(null)
  const [closingListingId, setClosingListingId] = useState<GameListingId | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true

    Promise.all(ownListings.map(async (listing) => [listing.id, (await getOwnerInterests(listing.id)).length] as const))
      .then((counts) => {
        if (mounted) setInterestCounts(Object.fromEntries(counts))
      })
      .catch(() => {
        if (mounted) setInterestCounts({})
      })

    return () => { mounted = false }
  }, [getOwnerInterests, ownListings])

  const activeListings = useMemo(
    () => ownListings.filter((listing) => listing.status === 'active'),
    [ownListings],
  )
  const closedListings = useMemo(
    () => ownListings.filter((listing) => listing.status === 'closed'),
    [ownListings],
  )

  const handleClose = async (listing: GameListing) => {
    setClosingListingId(listing.id)
    const result = await closeListing(listing.id)
    setClosingListingId(null)
    setConfirmingListingId(null)
    setMessage(result.ok
      ? 'El anuncio se ha cerrado. Sigue disponible en tu historial.'
      : 'No hemos podido cerrar el anuncio. Inténtalo de nuevo.')
  }

  return (
    <section className="page-container my-listings-page">
      <nav aria-label="Migas de pan" className="breadcrumb">
        <ol><li><Link to="/listings">Juegos de la comunidad</Link></li><li aria-current="page">Mis anuncios</li></ol>
      </nav>
      <div className="page-heading page-heading--with-action">
        <div>
          <p className="eyebrow">Juegos de la comunidad</p>
          <h1>Mis anuncios</h1>
          <p>Gestiona aquí los juegos que quieres vender o intercambiar.</p>
        </div>
        <Link className="button button--secondary" to="/listings/create">Publicar un juego</Link>
      </div>

      {message ? <div className="feedback-banner" role="status"><span aria-hidden="true">✓</span><p>{message}</p></div> : null}
      {loading ? <p className="listing-loading" aria-live="polite">Cargando tus anuncios…</p> : null}
      {!loading && loadError ? <div className="error-summary" role="alert"><strong>No hemos podido cargar tus anuncios.</strong><p>Comprueba tu conexión e inténtalo de nuevo.</p></div> : null}
      {!loading && !loadError ? (
        <div className="my-listings-page__sections">
          <ListingGroup
            emptyMessage="Aún no tienes anuncios activos."
            interestCounts={interestCounts}
            listings={activeListings}
            onClose={(listing) => setConfirmingListingId(listing.id)}
            title="Anuncios activos"
          />
          <ListingGroup
            emptyMessage="Todavía no has cerrado ningún anuncio."
            interestCounts={interestCounts}
            listings={closedListings}
            title="Anuncios cerrados"
          />
        </div>
      ) : null}

      {confirmingListingId ? (
        <div className="inline-confirm my-listings-page__confirm" role="group" aria-label="Confirmar cierre del anuncio">
          <p>¿Cerrar este anuncio? Dejará de aparecer en Juegos de la comunidad.</p>
          <button className="button button--danger" disabled={closingListingId === confirmingListingId} onClick={() => {
            const listing = activeListings.find((item) => item.id === confirmingListingId)
            if (listing) void handleClose(listing)
          }} type="button">Sí, cerrar anuncio</button>
          <button className="button button--ghost" disabled={closingListingId === confirmingListingId} onClick={() => setConfirmingListingId(null)} type="button">Volver</button>
        </div>
      ) : null}
    </section>
  )
}

function ListingGroup({
  emptyMessage,
  interestCounts,
  listings,
  onClose,
  title,
}: {
  readonly emptyMessage: string
  readonly interestCounts: InterestCounts
  readonly listings: readonly GameListing[]
  readonly onClose?: (listing: GameListing) => void
  readonly title: string
}) {
  const titleId = `${title.toLocaleLowerCase('es-ES').replaceAll(' ', '-')}-title`

  return (
    <section className="my-listings-page__group" aria-labelledby={titleId}>
      <div className="my-listings-page__group-heading">
        <h2 id={titleId}>{title}</h2>
        <span>{listings.length}</span>
      </div>
      {listings.length === 0 ? <p className="inline-empty">{emptyMessage}</p> : (
        <div className="listing-grid listing-grid--own">
          {listings.map((listing) => {
            const interestCount = interestCounts[listing.id] ?? 0
            return <GameListingCard
              footer={listing.status === 'active' || interestCount > 0 ? (
                <div className="listing-card__owner-actions">
                  {interestCount > 0 ? <p>{interestCount} {interestCount === 1 ? 'persona interesada' : 'personas interesadas'}</p> : null}
                  {listing.status === 'active' ? <div className="listing-owner-actions">
                    <Link className="button button--secondary" to={`/listings/${listing.id}/edit`}>Editar</Link>
                    <button className="button button--danger" onClick={() => onClose?.(listing)} type="button">Cerrar</button>
                  </div> : null}
                </div>
              ) : undefined}
              key={listing.id}
              listing={listing}
              showStatus
            />
          })}
        </div>
      )}
    </section>
  )
}
