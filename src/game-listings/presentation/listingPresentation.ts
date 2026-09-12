import type { ListingCondition, Money } from '../domain/gameListing'

export const getListingConditionLabel = (condition: ListingCondition) => ({
  new: 'Precintado',
  likeNew: 'Como nuevo',
  good: 'Buen estado',
  used: 'Usado / con señales',
})[condition]

export const formatListingPrice = (price: Money | undefined) =>
  price
    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: price.currency }).format(price.amountInCents / 100)
    : null
