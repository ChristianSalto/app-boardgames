import { Link } from 'react-router-dom'
import { GameListingCard } from './GameListingCard'
import { useGameListings } from './GameListingsProvider'

export function MyListingsSection() {
  const { loading, ownListings } = useGameListings()

  return (
    <section className="my-listings" aria-labelledby="my-listings-title">
      <div className="section-heading">
        <div><p className="eyebrow">Juegos de la comunidad</p><h2 id="my-listings-title">Mis anuncios</h2></div>
        <Link className="button button--secondary" to="/listings/create">Publicar un juego</Link>
      </div>
      <p className="my-listings__lead">Gestiona aquí los juegos que quieres vender o intercambiar.</p>
      {loading ? <p className="listing-loading" aria-live="polite">Cargando tus anuncios…</p> : null}
      {!loading && ownListings.length === 0 ? <div className="inline-empty"><p>Aún no has publicado ningún juego.</p></div> : null}
      {!loading && ownListings.length > 0 ? <div className="listing-grid listing-grid--own">{ownListings.map((listing) => <GameListingCard key={listing.id} listing={listing} showStatus />)}</div> : null}
    </section>
  )
}
