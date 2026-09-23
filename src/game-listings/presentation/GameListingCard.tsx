import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { GameListing } from '../domain/gameListing'
import { formatListingPrice, getListingConditionLabel } from './listingPresentation'

export function GameListingCard({
  className = '',
  footer,
  listing,
  showStatus = false,
}: {
  readonly className?: string
  readonly footer?: ReactNode
  readonly listing: GameListing
  readonly showStatus?: boolean
}) {
  const price = formatListingPrice(listing.price)

  return (
    <article className={`listing-card${className ? ` ${className}` : ''}`}>
      <img alt={`Imagen de ${listing.gameName}`} className="listing-card__image" src={listing.imageUrl} />
      <div className="listing-card__body">
        <div className="listing-card__meta">
          <span className={`listing-type listing-type--${listing.listingType}`}>
            {listing.listingType === 'sale' ? 'Venta' : 'Intercambio'}
          </span>
          {showStatus ? (
            <span className={`status-pill status-pill--listing-${listing.status}`}>
              {listing.status === 'active' ? 'Activo' : 'Cerrado'}
            </span>
          ) : null}
        </div>
        <h3>{listing.gameName}</h3>
        <p className="listing-card__condition">{getListingConditionLabel(listing.condition)}</p>
        <div className="listing-card__facts">
          <span>{listing.city} · {listing.district}</span>
          <strong>{price ?? 'Intercambio'}</strong>
        </div>
        <Link className="text-link" to={`/listings/${listing.id}`}>
          Ver anuncio <span aria-hidden="true">→</span>
        </Link>
        {footer}
      </div>
    </article>
  )
}
