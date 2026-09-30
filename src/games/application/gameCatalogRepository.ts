import type { Game } from '../domain/game.ts'

export type GameCatalogRepository = Readonly<{
  list: () => Promise<readonly Game[]>
}>

export const listGames = (repository: GameCatalogRepository) => repository.list()
