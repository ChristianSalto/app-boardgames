import { addDoc, collection, doc, getDoc, getDocs, query, runTransaction, Timestamp, where, type Firestore } from 'firebase/firestore'
import { isFutureSessionInput, isValidCapacity, sessionInstantFromMadridCivil } from '../model'
import type { CreateSessionInput, GameSession, SessionLifecycle, SessionTone, UpdateSessionInput } from '../types'
import type { GameSessionRepository } from '../application/gameSessionRepository'

type GameSessionDocument = Readonly<{ gameName: string; startsAt?: Timestamp; date?: string; time?: string; city: string; district: string; venue?: string; description?: string; capacity: number; organizerId: string; participantIds?: readonly string[]; pendingRequestIds?: readonly string[]; status: SessionLifecycle }>

const tones: readonly SessionTone[] = ['forest', 'terracotta', 'mustard', 'blue', 'plum']
const toneFor = (value: string) => tones[value.length % tones.length] ?? 'forest'
const canonicalStartsAt = (data: GameSessionDocument) => {
  if (data.startsAt) return data.startsAt.toDate().toISOString()
  if (data.date && data.time) return sessionInstantFromMadridCivil(data.date, data.time)
  throw new Error('SESSION_STARTS_AT_MISSING')
}

const toSession = (id: string, data: GameSessionDocument): GameSession => ({ id, game: data.gameName, startsAt: canonicalStartsAt(data), city: data.city, zone: data.district, place: data.venue ?? '', description: data.description ?? '', capacity: data.capacity, organizerId: data.organizerId, lifecycle: data.status, participantIds: data.participantIds ?? [data.organizerId], requests: [], tone: toneFor(data.gameName) })

const toDocument = (input: CreateSessionInput, organizerId: string): GameSessionDocument => {
  if (!isValidCapacity(input.capacity)) throw new Error('Invalid capacity')
  const startsAt = Timestamp.fromDate(new Date(sessionInstantFromMadridCivil(input.date, input.time)))
  return { gameName: input.game, startsAt, city: 'Madrid', district: input.zone, ...(input.place ? { venue: input.place } : {}), ...(input.description ? { description: input.description } : {}), capacity: input.capacity, organizerId, participantIds: [organizerId], pendingRequestIds: [], status: 'scheduled' }
}

const toMutableDocument = (input: UpdateSessionInput) => ({
  gameName: input.game,
  startsAt: Timestamp.fromDate(new Date(sessionInstantFromMadridCivil(input.date, input.time))),
  district: input.zone,
  venue: input.place.trim(),
  description: input.description.trim(),
  capacity: input.capacity,
})

export const createFirestoreGameSessionRepository = (firestore: Firestore): GameSessionRepository => ({
  discover: async () => (await getDocs(collection(firestore, 'gameSessions'))).docs.map((snapshot) => toSession(snapshot.id, snapshot.data() as GameSessionDocument)),
  getById: async (id) => { const snapshot = await getDoc(doc(firestore, 'gameSessions', id)); return snapshot.exists() ? toSession(snapshot.id, snapshot.data() as GameSessionDocument) : null },
  create: async (input, organizerId) => { const data = toDocument(input, organizerId); const snapshot = await addDoc(collection(firestore, 'gameSessions'), data); return toSession(snapshot.id, data) },
  update: async (id, input, organizerId) => {
    const reference = doc(firestore, 'gameSessions', id)
    return runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(reference)
      if (!snapshot.exists()) throw new Error('SESSION_NOT_FOUND')
      const current = snapshot.data() as GameSessionDocument
      if (current.organizerId !== organizerId) throw new Error('NOT_ORGANIZER')
      if (current.status !== 'scheduled') throw new Error('SESSION_UNAVAILABLE')
      if (new Date(canonicalStartsAt(current)).getTime() <= Date.now()) throw new Error('SESSION_ALREADY_STARTED')
      if (!isFutureSessionInput(input)) throw new Error('SESSION_NOT_FUTURE')
      if (!isValidCapacity(input.capacity) || input.capacity < (current.participantIds ?? [current.organizerId]).length) {
        throw new Error('INVALID_CAPACITY')
      }
      const changes = toMutableDocument(input)
      transaction.update(reference, changes)
      return toSession(id, { ...current, ...changes })
    })
  },
  cancel: async (id, organizerId) => {
    const sessionReference = doc(firestore, 'gameSessions', id)
    const requests = collection(firestore, 'participationRequests')
    await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(sessionReference)
      if (!snapshot.exists()) throw new Error('SESSION_NOT_FOUND')
      const session = snapshot.data() as GameSessionDocument
      if (session.organizerId !== organizerId) throw new Error('NOT_ORGANIZER')
      if (session.status !== 'scheduled') throw new Error('SESSION_UNAVAILABLE')
      const pendingRequestSnapshots = await Promise.all(
        (session.pendingRequestIds ?? []).map((requestId) => transaction.get(doc(requests, requestId))),
      )
      transaction.update(sessionReference, { status: 'cancelled', pendingRequestIds: [] })
      pendingRequestSnapshots.forEach((requestSnapshot) => {
        if (requestSnapshot.exists() && requestSnapshot.data().status === 'pending') {
          transaction.update(requestSnapshot.ref, { status: 'rejected' })
        }
      })
    })
  },
  getOrganizedBy: async (organizerId) => (await getDocs(query(collection(firestore, 'gameSessions'), where('organizerId', '==', organizerId)))).docs.map((snapshot) => toSession(snapshot.id, snapshot.data() as GameSessionDocument)),
})
