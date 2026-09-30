import { collection, getDocs, type Firestore } from 'firebase/firestore'
import type { GameCatalogRepository } from '../application/gameCatalogRepository.ts'
import { isValidGameId, isValidGameName, type Game } from '../domain/game.ts'

export const createFirestoreGameCatalogRepository = (firestore: Firestore): GameCatalogRepository => ({
  list: async () => {
    const snapshots = await getDocs(collection(firestore, 'games'))
    return snapshots.docs.map((snapshot): Game => {
      const name: unknown = snapshot.data().name
      const aliases: unknown = snapshot.data().aliases
      if (!isValidGameId(snapshot.id) || typeof name !== 'string' || !isValidGameName(name)) {
        throw new Error('INVALID_GAME_CATALOG_ENTRY')
      }
      if (aliases !== undefined && (!Array.isArray(aliases)
        || !aliases.every((alias: unknown) => typeof alias === 'string' && isValidGameName(alias)))) {
        throw new Error('INVALID_GAME_CATALOG_ENTRY')
      }
      return { id: snapshot.id, name, ...(aliases === undefined ? {} : { aliases: aliases as string[] }) }
    }).sort((first, second) => first.name.localeCompare(second.name, 'es'))
  },
})
