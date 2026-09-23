import { collection, doc, getDoc, getDocs, orderBy, query, runTransaction, type Firestore, type Timestamp } from 'firebase/firestore'
import type { ListingInterestRepository } from '../application/listingInterestRepository.ts'
import type { ListingContactHandoff } from '../domain/listingContactHandoff.ts'
import type { ListingInterest, ListingInterestStatus } from '../domain/listingInterest.ts'

type InterestDocument = Readonly<{ playerId: string; status: ListingInterestStatus; createdAt: Timestamp }>
type HandoffDocument = Readonly<{ interestedPlayerId: string; sharedByOwnerId: string; method: ListingContactHandoff['method']; value: string; createdAt: Timestamp }>
type ListingDocument = Readonly<{ ownerId: string; status: 'active' | 'closed' }>

const interestReference = (firestore: Firestore, listingId: string, playerId: string) => doc(firestore, 'gameListings', listingId, 'interests', playerId)
const handoffReference = (firestore: Firestore, listingId: string, playerId: string) => doc(firestore, 'gameListings', listingId, 'contactHandoffs', playerId)
const listingReference = (firestore: Firestore, listingId: string) => doc(firestore, 'gameListings', listingId)

const toInterest = (listingId: string, data: InterestDocument): ListingInterest => ({ listingId, playerId: data.playerId, status: data.status, createdAt: data.createdAt.toDate().toISOString() })
const toHandoff = (listingId: string, data: HandoffDocument): ListingContactHandoff => ({ listingId, interestedPlayerId: data.interestedPlayerId, sharedByOwnerId: data.sharedByOwnerId, method: data.method, value: data.value, createdAt: data.createdAt.toDate().toISOString() })
const persistenceError = () => new Error('LISTING_INTEREST_PERSISTENCE_FAILED')

export const createFirestoreListingInterestRepository = (firestore: Firestore): ListingInterestRepository => ({
  createPending: async (interest) => {
    try {
      await runTransaction(firestore, async (transaction) => {
        const listingSnapshot = await transaction.get(listingReference(firestore, interest.listingId))
        const reference = interestReference(firestore, interest.listingId, interest.playerId)
        const existing = await transaction.get(reference)
        if (!listingSnapshot.exists() || existing.exists()) throw persistenceError()
        const listing = listingSnapshot.data() as ListingDocument
        if (listing.status !== 'active' || listing.ownerId === interest.playerId) throw persistenceError()
        transaction.set(reference, { playerId: interest.playerId, status: 'pending', createdAt: new Date(interest.createdAt) })
      })
      return interest
    } catch { throw persistenceError() }
  },
  getByListingAndPlayer: async (listingId, playerId) => {
    try { const snapshot = await getDoc(interestReference(firestore, listingId, playerId)); return snapshot.exists() ? toInterest(listingId, snapshot.data() as InterestDocument) : null } catch { throw persistenceError() }
  },
  getForListing: async (listingId) => {
    try { const snapshots = await getDocs(query(collection(firestore, 'gameListings', listingId, 'interests'), orderBy('createdAt', 'desc'))); return snapshots.docs.map((snapshot) => toInterest(listingId, snapshot.data() as InterestDocument)) } catch { throw persistenceError() }
  },
  resolve: async (interest) => {
    try {
      await runTransaction(firestore, async (transaction) => {
        const listingSnapshot = await transaction.get(listingReference(firestore, interest.listingId))
        const reference = interestReference(firestore, interest.listingId, interest.playerId)
        const existing = await transaction.get(reference)
        if (!listingSnapshot.exists() || !existing.exists()) throw persistenceError()
        const listing = listingSnapshot.data() as ListingDocument
        const current = existing.data() as InterestDocument
        if (listing.status !== 'active' || current.status !== 'pending') throw persistenceError()
        transaction.update(reference, { status: interest.status })
      })
      return interest
    } catch { throw persistenceError() }
  },
  saveContactHandoff: async (handoff) => {
    try {
      return await runTransaction(firestore, async (transaction) => {
        const listingSnapshot = await transaction.get(listingReference(firestore, handoff.listingId))
        const interestSnapshot = await transaction.get(interestReference(firestore, handoff.listingId, handoff.interestedPlayerId))
        const reference = handoffReference(firestore, handoff.listingId, handoff.interestedPlayerId)
        const existingHandoff = await transaction.get(reference)
        if (!listingSnapshot.exists() || !interestSnapshot.exists()) throw persistenceError()
        const listing = listingSnapshot.data() as ListingDocument
        const interest = interestSnapshot.data() as InterestDocument
        if (listing.ownerId !== handoff.sharedByOwnerId || interest.status !== 'accepted') throw persistenceError()
        const storedHandoff = existingHandoff.exists() ? existingHandoff.data() as HandoffDocument : null
        const createdAt = storedHandoff?.createdAt ?? new Date(handoff.createdAt)
        transaction.set(reference, { interestedPlayerId: handoff.interestedPlayerId, sharedByOwnerId: handoff.sharedByOwnerId, method: handoff.method, value: handoff.value, createdAt })
        return { ...handoff, createdAt: storedHandoff?.createdAt.toDate().toISOString() ?? handoff.createdAt }
      })
    } catch { throw persistenceError() }
  },
  getContactHandoff: async (listingId, playerId) => {
    try { const snapshot = await getDoc(handoffReference(firestore, listingId, playerId)); return snapshot.exists() ? toHandoff(listingId, snapshot.data() as HandoffDocument) : null } catch { throw persistenceError() }
  },
})
