import type { Game } from '../domain/game.ts'

export type GameCatalogRepository = Readonly<{
  list: () => Promise<readonly Game[]>
}>

export const listGames = (repository: GameCatalogRepository) => repository.list()

export const cacheGameCatalog = (repository: GameCatalogRepository): GameCatalogRepository => {
  let pending: Promise<readonly Game[]> | null = null
  return {
    list: () => {
      pending ??= repository.list().catch((error: unknown) => {
        pending = null
        throw error
      })
      return pending
    },
  }
}
