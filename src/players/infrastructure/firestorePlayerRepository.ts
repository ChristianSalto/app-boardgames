import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore'
import type { PlayerRepository } from '../application/playerRepository'
import type { CreatePlayerInput, Player } from '../types'

type PlayerDocument = Readonly<{
  displayName: string
  city: 'Madrid'
  district?: string
  description?: string
  avatarUrl?: string
}>

const toPlayer = (id: string, data: PlayerDocument): Player => ({
  id,
  displayName: data.displayName,
  city: data.city,
  district: data.district,
  description: data.description,
  avatarUrl: data.avatarUrl,
})

const toDocument = (input: CreatePlayerInput): PlayerDocument => ({
  displayName: input.displayName,
  city: input.city,
  ...(input.district ? { district: input.district } : {}),
  ...(input.description ? { description: input.description } : {}),
})

export const createFirestorePlayerRepository = (
  firestore: Firestore,
): PlayerRepository => ({
  getById: async (id) => {
    const snapshot = await getDoc(doc(firestore, 'players', id))
    return snapshot.exists() ? toPlayer(snapshot.id, snapshot.data() as PlayerDocument) : null
  },
  create: async (input) => {
    const playerDocument = toDocument(input)
    await setDoc(doc(firestore, 'players', input.id), playerDocument)
    return toPlayer(input.id, playerDocument)
  },
})
