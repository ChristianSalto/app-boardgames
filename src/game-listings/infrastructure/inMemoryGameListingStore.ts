import type { GameListingRepository } from '../application/gameListingRepository.ts'
import type { ListingInterestRepository } from '../application/listingInterestRepository.ts'
import type { GameListing } from '../domain/gameListing.ts'
import type { ListingInterest } from '../domain/listingInterest.ts'
import type { ListingContactHandoff } from '../domain/listingContactHandoff.ts'

export type InMemoryGameListingStore = Readonly<{
  gameListingRepository: GameListingRepository
  listingInterestRepository: ListingInterestRepository
}>

const imageDataUri = (title: string, background: string, foreground: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="${background}"/><path d="M80 80h640v340H80z" fill="none" stroke="${foreground}" stroke-width="12" opacity=".38"/><circle cx="650" cy="145" r="72" fill="${foreground}" opacity=".22"/><path d="M150 365 310 210l125 115 105-105 120 145" fill="none" stroke="${foreground}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity=".62"/><text x="80" y="115" fill="${foreground}" font-family="Georgia,serif" font-size="44" font-weight="700">${title}</text><text x="80" y="430" fill="${foreground}" font-family="Arial,sans-serif" font-size="22" letter-spacing="4">MESA ABIERTA</text></svg>`)}`

const sampleListings: readonly GameListing[] = [
  {
    id: 'listing-wingspan',
    ownerId: 'lucia',
    gameName: 'Wingspan',
    imageUrl: imageDataUri('Wingspan', '#d7e6dc', '#153c31'),
    description: 'Como nuevo y completo. Lo he jugado unas pocas veces y está muy cuidado.',
    condition: 'likeNew',
    listingType: 'sale',
    price: { amountInCents: 3200, currency: 'EUR' },
    city: 'Madrid',
    district: 'Centro',
    status: 'active',
    createdAt: '2026-09-11T16:30:00.000Z',
  },
  {
    id: 'listing-root',
    ownerId: 'diego',
    gameName: 'Root',
    imageUrl: imageDataUri('Root', '#f5ded5', '#973e25'),
    description: 'Busco intercambiarlo por un euro medio o un juego de cartas con buena rejugabilidad.',
    condition: 'good',
    listingType: 'trade',
    city: 'Madrid',
    district: 'Retiro',
    status: 'active',
    createdAt: '2026-09-10T18:10:00.000Z',
  },
  {
    id: 'listing-azul',
    ownerId: 'sara',
    gameName: 'Azul',
    imageUrl: imageDataUri('Azul', '#f6e8c5', '#6d4a08'),
    description: 'Caja con señales de uso, pero componentes completos y en buen estado.',
    condition: 'used',
    listingType: 'sale',
    price: { amountInCents: 1800, currency: 'EUR' },
    city: 'Madrid',
    district: 'Arganzuela',
    status: 'active',
    createdAt: '2026-09-09T12:00:00.000Z',
  },
]

export const createInMemoryGameListingStore = (): InMemoryGameListingStore => {
  let listings: readonly GameListing[] = sampleListings
  let interests: readonly ListingInterest[] = []
  let handoffs: readonly ListingContactHandoff[] = []

  const gameListingRepository: GameListingRepository = {
    create: async (listing) => {
      listings = [listing, ...listings]
      return listing
    },
    discoverActive: async ({ city, limit }) => listings
      .filter((listing) => listing.status === 'active' && listing.city === city)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
      .slice(0, limit),
    getById: async (id) => listings.find((listing) => listing.id === id) ?? null,
    getByOwnerId: async (ownerId) => listings
      .filter((listing) => listing.ownerId === ownerId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
    updateActive: async (listing) => {
      listings = listings.map((item) => item.id === listing.id ? listing : item)
      return listing
    },
    close: async (listing) => {
      listings = listings.map((item) => item.id === listing.id ? listing : item)
      return listing
    },
  }

  const listingInterestRepository: ListingInterestRepository = {
    createPending: async (interest) => {
      interests = [...interests, interest]
      return interest
    },
    getByListingAndPlayer: async (listingId, playerId) => interests.find(
      (interest) => interest.listingId === listingId && interest.playerId === playerId,
    ) ?? null,
    getForListing: async (listingId) => interests.filter((interest) => interest.listingId === listingId),
    resolve: async (interest) => {
      interests = interests.map((item) => item.listingId === interest.listingId && item.playerId === interest.playerId ? interest : item)
      return interest
    },
    saveContactHandoff: async (handoff) => {
      handoffs = [...handoffs.filter((item) => item.listingId !== handoff.listingId || item.interestedPlayerId !== handoff.interestedPlayerId), handoff]
      return handoff
    },
    getContactHandoff: async (listingId, playerId) => handoffs.find(
      (handoff) => handoff.listingId === listingId && handoff.interestedPlayerId === playerId,
    ) ?? null,
  }

  return { gameListingRepository, listingInterestRepository }
}
