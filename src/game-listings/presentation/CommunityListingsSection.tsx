import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameListings } from './GameListingsProvider'
import { GameListingCard } from './GameListingCard'

const listingBatchSize = 6

export function CommunityListingsSection() {
  const { activeListings, loadError, loading } = useGameListings()
  const [visibleCount, setVisibleCount] = useState(listingBatchSize)
  const [announcement, setAnnouncement] = useState('')
  const visibleListings = activeListings.slice(0, visibleCount)
  const hasMoreListings = visibleCount < activeListings.length

  const showMore = () => {
    const nextVisibleCount = Math.min(visibleCount + listingBatchSize, activeListings.length)
    setVisibleCount(nextVisibleCount)
    setAnnouncement(`${nextVisibleCount - visibleCount} anuncios más visibles.`)
  }

  return (
    <section className="community-listings" id="community-listings" aria-labelledby="community-listings-title">
      <div className="section-heading community-listings__heading">
        <div>
          <h2 id="community-listings-title">Juegos de la comunidad</h2>
          <p className="section-heading__lead">Juegos que otras personas de Madrid venden o intercambian.</p>
        </div>
        <Link className="button button--secondary community-listings__publish" to="/listings/create">Publicar juego</Link>
      </div>

      {loading ? <p className="listing-loading" aria-live="polite">Cargando anuncios…</p> : null}
      {!loading && loadError ? <div className="inline-empty" role="alert"><p>No hemos podido cargar los anuncios.</p></div> : null}
      {!loading && !loadError && activeListings.length === 0 ? <div className="inline-empty"><p>Todavía no hay juegos publicados por la comunidad.</p></div> : null}
      {!loading && !loadError && visibleListings.length > 0 ? (
        <>
          <div className="listing-grid listing-grid--community" id="community-listings-grid">
            {visibleListings.map((listing) => <GameListingCard className="listing-card--reveal" key={listing.id} listing={listing} />)}
          </div>
          {hasMoreListings ? (
            <div className="community-listings__more">
              <button aria-controls="community-listings-grid" className="button button--ghost" onClick={showMore} type="button">Mostrar más</button>
            </div>
          ) : null}
          <p aria-live="polite" className="u-visually-hidden">{announcement}</p>
        </>
      ) : null}
    </section>
  )
}
