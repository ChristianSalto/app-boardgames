import { collection, deleteField, doc, getDoc, getDocs, orderBy, query, updateDoc, where, setDoc, type Firestore, type Timestamp } from 'firebase/firestore'
import type { GameListingRepository } from '../application/gameListingRepository.ts'
import { createListingOperationFailure } from '../application/listingOperationFailure.ts'
import type { GameListing } from '../domain/gameListing.ts'

type ListingDocument = Readonly<{ ownerId: string; gameName: string; imageUrl: string; description: string; condition: GameListing['condition']; listingType: GameListing['listingType']; priceInCents?: number; city: string; district: string; status: GameListing['status']; createdAt: Timestamp }>

const toListing = (id: string, data: ListingDocument): GameListing => {
  const base = { id, ownerId: data.ownerId, gameName: data.gameName, imageUrl: data.imageUrl, description: data.description, condition: data.condition, city: data.city, district: data.district, status: data.status, createdAt: data.createdAt.toDate().toISOString() }
  return data.listingType === 'sale'
    ? { ...base, listingType: 'sale', price: { amountInCents: data.priceInCents ?? 0, currency: 'EUR' } }
    : { ...base, listingType: 'trade' }
}

const toDocument = (listing: GameListing) => ({
  ownerId: listing.ownerId, gameName: listing.gameName, imageUrl: listing.imageUrl, description: listing.description,
  condition: listing.condition, listingType: listing.listingType, city: listing.city, district: listing.district,
  status: listing.status, createdAt: new Date(listing.createdAt),
  ...(listing.listingType === 'sale' ? { priceInCents: listing.price.amountInCents } : {}),
})

const toMutableDocument = (listing: GameListing) => ({
  gameName: listing.gameName, imageUrl: listing.imageUrl, description: listing.description,
  condition: listing.condition, listingType: listing.listingType, city: listing.city,
  district: listing.district, status: listing.status,
  priceInCents: listing.listingType === 'sale' ? listing.price.amountInCents : deleteField(),
})

const asListingError = () => createListingOperationFailure('listing-persistence-failed')

export const createFirestoreGameListingRepository = (firestore: Firestore): GameListingRepository => {
  const listings = collection(firestore, 'gameListings')
  return {
    create: async (listing) => { try { await setDoc(doc(listings, listing.id), toDocument(listing)); return listing } catch { throw asListingError() } },
    discoverActive: async ({ city, limit }) => {
      try {
        const snapshots = await getDocs(query(listings, where('status', '==', 'active'), where('city', '==', city), orderBy('createdAt', 'desc')))
        const matchingListings = snapshots.docs.map((snapshot) => toListing(snapshot.id, snapshot.data() as ListingDocument))
        return limit === undefined ? matchingListings : matchingListings.slice(0, limit)
      } catch { throw asListingError() }
    },
    getById: async (id) => { try { const snapshot = await getDoc(doc(listings, id)); return snapshot.exists() ? toListing(snapshot.id, snapshot.data() as ListingDocument) : null } catch { throw asListingError() } },
    getByOwnerId: async (ownerId) => { try { const snapshots = await getDocs(query(listings, where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'))); return snapshots.docs.map((snapshot) => toListing(snapshot.id, snapshot.data() as ListingDocument)) } catch { throw asListingError() } },
    updateActive: async (listing) => { try { await updateDoc(doc(listings, listing.id), toMutableDocument(listing)); return listing } catch { throw asListingError() } },
    close: async (listing) => { try { await updateDoc(doc(listings, listing.id), { status: 'closed' }); return listing } catch { throw asListingError() } },
  }
}
