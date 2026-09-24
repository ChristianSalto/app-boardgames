import {
  Timestamp,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  where,
  type Firestore,
} from 'firebase/firestore'
import type {
  PlayerReviewCursor,
  PlayerReviewRepository,
} from '../application/playerTrustRepository.ts'
import type { PlayerReview } from '../domain/playerReview.ts'

type PlayerReviewDocument = Readonly<{
  id: string
  sessionId: string
  reviewerId: string
  reviewedPlayerId: string
  rating: number
  comment?: string
  createdAt: Timestamp
}>

const toReview = (id: string, data: PlayerReviewDocument): PlayerReview => {
  if (!(data.createdAt instanceof Timestamp)) throw new Error('REVIEW_CREATED_AT_MISSING')
  return {
    id,
    sessionId: data.sessionId,
    reviewerId: data.reviewerId,
    reviewedPlayerId: data.reviewedPlayerId,
    rating: data.rating,
    ...(data.comment ? { comment: data.comment } : {}),
    createdAt: data.createdAt.toDate().toISOString(),
  }
}

export const createFirestorePlayerReviewRepository = (
  firestore: Firestore,
): PlayerReviewRepository => {
  const reviews = collection(firestore, 'playerReviews')

  return {
    create: async (review) => {
      const reference = doc(reviews, review.id)
      const created = await runTransaction(firestore, async (transaction) => {
        const snapshot = await transaction.get(reference)
        if (snapshot.exists()) return false
        transaction.set(reference, {
          ...review,
          createdAt: serverTimestamp(),
        })
        return true
      })
      if (!created) return { kind: 'duplicate' }

      const snapshot = await getDoc(reference)
      if (!snapshot.exists()) throw new Error('REVIEW_NOT_FOUND_AFTER_CREATE')
      return {
        kind: 'created',
        review: toReview(snapshot.id, snapshot.data() as PlayerReviewDocument),
      }
    },

    getReceivedBy: async (playerId) => {
      const snapshots = await getDocs(query(reviews, where('reviewedPlayerId', '==', playerId)))
      return snapshots.docs.map((snapshot) =>
        toReview(snapshot.id, snapshot.data() as PlayerReviewDocument),
      )
    },

    getReceivedPage: async (playerId, pageSize, cursor?: PlayerReviewCursor) => {
      const pageQuery = cursor
        ? query(
            reviews,
            where('reviewedPlayerId', '==', playerId),
            orderBy('createdAt', 'desc'),
            orderBy(documentId(), 'asc'),
            startAfter(Timestamp.fromDate(new Date(cursor.createdAt)), cursor.id),
            limit(pageSize + 1),
          )
        : query(
            reviews,
            where('reviewedPlayerId', '==', playerId),
            orderBy('createdAt', 'desc'),
            orderBy(documentId(), 'asc'),
            limit(pageSize + 1),
          )
      const snapshots = await getDocs(pageQuery)
      const page = snapshots.docs.slice(0, pageSize).map((snapshot) =>
        toReview(snapshot.id, snapshot.data() as PlayerReviewDocument),
      )
      const last = page.at(-1)
      return {
        reviews: page,
        ...(snapshots.size > pageSize && last
          ? { nextCursor: { createdAt: last.createdAt, id: last.id } }
          : {}),
      }
    },

    getBySessionAndReviewer: async (sessionId, reviewerId) => {
      const snapshots = await getDocs(query(
        reviews,
        where('sessionId', '==', sessionId),
        where('reviewerId', '==', reviewerId),
      ))
      return snapshots.docs.map((snapshot) =>
        toReview(snapshot.id, snapshot.data() as PlayerReviewDocument),
      )
    },
  }
}
