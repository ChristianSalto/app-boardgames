import { Link } from 'react-router-dom'
import { useGameListings } from './GameListingsProvider'
import { GameListingCard } from './GameListingCard'

export function CommunityListingsSection() {
  const { activeListings, loading } = useGameListings()
  const recentListings = activeListings.slice(0, 3)

  if (!loading && recentListings.length === 0) return null

  return (
    <section className="community-listings" aria-labelledby="community-listings-title">
      <div className="section-heading community-listings__heading">
        <div>
          <h2 id="community-listings-title">Juegos de la comunidad</h2>
          <p className="section-heading__lead">Juegos que otras personas de Madrid venden o intercambian.</p>
        </div>
        <Link className="text-link" to="/listings">Ver todos <span aria-hidden="true">→</span></Link>
      </div>

      {loading ? <p className="listing-loading" aria-live="polite">Cargando anuncios…</p> : (
        <div className="listing-grid listing-grid--compact">
          {recentListings.map((listing) => <GameListingCard key={listing.id} listing={listing} />)}
        </div>
      )}
    </section>
  )
}
