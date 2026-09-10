import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type Firestore,
  type Timestamp,
} from 'firebase/firestore'
import type { ParticipationRequestRepository } from '../application/participationRequestRepository'
import type { ParticipationRequest, RequestState, SessionLifecycle } from '../types'

type ParticipationRequestDocument = Readonly<{
  sessionId: string
  playerId: string
  status: RequestState
  createdAt?: Timestamp
}>

type GameSessionDocument = Readonly<{
  organizerId: string
  capacity: number
  participantIds?: readonly string[]
  pendingRequestIds?: readonly string[]
  status: SessionLifecycle
}>

const requestIdFor = (sessionId: string, playerId: string) => `${sessionId}_${playerId}`

const toParticipationRequest = (
  id: string,
  data: ParticipationRequestDocument,
): ParticipationRequest => ({
  id,
  sessionId: data.sessionId,
  playerId: data.playerId,
  status: data.status,
  ...(data.createdAt ? { createdAt: data.createdAt.toDate().toISOString() } : {}),
})

const getParticipants = (session: GameSessionDocument) =>
  [...(session.participantIds ?? [session.organizerId])]

const getPendingRequestIds = (session: GameSessionDocument) =>
  [...(session.pendingRequestIds ?? [])]

const assertOpenSession = (session: GameSessionDocument) => {
  if (session.status !== 'scheduled') throw new Error('SESSION_UNAVAILABLE')
  if (getParticipants(session).length >= session.capacity) throw new Error('SESSION_FULL')
}

export const createFirestoreParticipationRequestRepository = (
  firestore: Firestore,
): ParticipationRequestRepository => {
  const requests = collection(firestore, 'participationRequests')
  const sessions = collection(firestore, 'gameSessions')

  return {
    requestParticipation: async (sessionId, playerId) => {
      const sessionReference = doc(sessions, sessionId)
      const requestReference = doc(requests, requestIdFor(sessionId, playerId))

      await runTransaction(firestore, async (transaction) => {
        const [sessionSnapshot, requestSnapshot] = await Promise.all([
          transaction.get(sessionReference),
          transaction.get(requestReference),
        ])
        if (!sessionSnapshot.exists()) throw new Error('SESSION_NOT_FOUND')
        if (requestSnapshot.exists()) throw new Error('REQUEST_ALREADY_EXISTS')

        const session = sessionSnapshot.data() as GameSessionDocument
        assertOpenSession(session)
        if (session.organizerId === playerId || getParticipants(session).includes(playerId)) {
          throw new Error('PARTICIPATION_ALREADY_EXISTS')
        }

        transaction.set(requestReference, {
          sessionId,
          playerId,
          status: 'pending',
          createdAt: serverTimestamp(),
        })
        transaction.update(sessionReference, {
          pendingRequestIds: [...getPendingRequestIds(session), requestReference.id],
        })
      })
    },

    getParticipationForPlayer: async (playerId) => {
      const snapshots = await getDocs(query(requests, where('playerId', '==', playerId)))
      return snapshots.docs.map((snapshot) =>
        toParticipationRequest(snapshot.id, snapshot.data() as ParticipationRequestDocument),
      )
    },

    getPendingRequestsForSession: async (sessionId) => {
      const snapshots = await getDocs(query(requests, where('sessionId', '==', sessionId)))
      return snapshots.docs
        .map((snapshot) =>
          toParticipationRequest(snapshot.id, snapshot.data() as ParticipationRequestDocument),
        )
        .filter((item) => item.status === 'pending')
    },

    acceptParticipationRequest: async (sessionId, playerId, organizerId) => {
      const sessionReference = doc(sessions, sessionId)
      const requestReference = doc(requests, requestIdFor(sessionId, playerId))

      await runTransaction(firestore, async (transaction) => {
        const [sessionSnapshot, requestSnapshot] = await Promise.all([
          transaction.get(sessionReference),
          transaction.get(requestReference),
        ])
        if (!sessionSnapshot.exists() || !requestSnapshot.exists()) throw new Error('REQUEST_NOT_FOUND')

        const session = sessionSnapshot.data() as GameSessionDocument
        const request = requestSnapshot.data() as ParticipationRequestDocument
        if (session.organizerId !== organizerId) throw new Error('NOT_ORGANIZER')
        if (request.playerId !== playerId || request.sessionId !== sessionId || request.status !== 'pending') {
          throw new Error('REQUEST_NOT_PENDING')
        }
        assertOpenSession(session)

        const participantIds = getParticipants(session)
        if (participantIds.includes(playerId)) throw new Error('PARTICIPATION_ALREADY_EXISTS')
        const nextParticipantIds = [...participantIds, playerId]
        const pendingRequestReferences = nextParticipantIds.length === session.capacity
          ? getPendingRequestIds(session)
            .filter((id) => id !== requestReference.id)
            .map((id) => doc(requests, id))
          : []
        const pendingRequestSnapshots = await Promise.all(
          pendingRequestReferences.map((reference) => transaction.get(reference)),
        )

        transaction.update(sessionReference, {
          participantIds: nextParticipantIds,
          pendingRequestIds: nextParticipantIds.length === session.capacity
            ? []
            : getPendingRequestIds(session).filter((id) => id !== requestReference.id),
        })
        transaction.update(requestReference, { status: 'confirmed' })

        if (pendingRequestSnapshots.length > 0) {
          pendingRequestSnapshots.forEach((snapshot) => {
            if (snapshot.exists()) {
            const candidate = snapshot.data() as ParticipationRequestDocument
            if (candidate.status === 'pending') {
              transaction.update(snapshot.ref, { status: 'rejected' })
            }
            }
          })
        }
      })
    },

    rejectParticipationRequest: async (sessionId, playerId, organizerId) => {
      const sessionReference = doc(sessions, sessionId)
      const requestReference = doc(requests, requestIdFor(sessionId, playerId))
      await runTransaction(firestore, async (transaction) => {
        const [sessionSnapshot, requestSnapshot] = await Promise.all([
          transaction.get(sessionReference),
          transaction.get(requestReference),
        ])
        if (!sessionSnapshot.exists() || !requestSnapshot.exists()) throw new Error('REQUEST_NOT_FOUND')

        const session = sessionSnapshot.data() as GameSessionDocument
        const request = requestSnapshot.data() as ParticipationRequestDocument
        if (session.organizerId !== organizerId) throw new Error('NOT_ORGANIZER')
        if (request.playerId !== playerId || request.sessionId !== sessionId || request.status !== 'pending') {
          throw new Error('REQUEST_NOT_PENDING')
        }
        transaction.update(requestReference, { status: 'rejected' })
        transaction.update(sessionReference, {
          pendingRequestIds: getPendingRequestIds(session).filter((id) => id !== requestReference.id),
        })
      })
    },
  }
}
