import { Link } from 'react-router-dom'
import { GameListingCard } from './GameListingCard'
import { useGameListings } from './GameListingsProvider'

export function GameListingsPage() {
  const { activeListings, loadError, loading } = useGameListings()

  return (
    <section className="page-container listing-page">
      <nav aria-label="Migas de pan" className="breadcrumb">
        <ol><li><Link to="/">Explorar</Link></li><li aria-current="page">Juegos de la comunidad</li></ol>
      </nav>
      <div className="page-heading page-heading--with-action">
        <div>
          <p className="eyebrow">Comunidad de juegos de mesa</p>
          <h1>Juegos de la comunidad</h1>
          <p>Anuncios recientes de venta e intercambio en Madrid.</p>
        </div>
        <Link className="button button--secondary" to="/listings/create">Publicar un juego</Link>
      </div>

      {loading ? <p className="listing-loading" aria-live="polite">Cargando anuncios…</p> : null}
      {!loading && loadError ? <div className="error-summary" role="alert"><strong>No hemos podido cargar los anuncios.</strong><p>Comprueba tu conexión e inténtalo de nuevo.</p></div> : null}
      {!loading && !loadError && activeListings.length === 0 ? (
        <div className="empty-state">
          <h2>Todavía no hay anuncios activos</h2>
          <p>Publica un juego si quieres ponerlo en venta o proponer un intercambio.</p>
          <Link className="button button--primary" to="/listings/create">Publicar un juego</Link>
        </div>
      ) : null}
      {!loading && !loadError && activeListings.length > 0 ? (
        <div className="listing-grid">
          {activeListings.map((listing) => <GameListingCard key={listing.id} listing={listing} />)}
        </div>
      ) : null}
    </section>
  )
}
