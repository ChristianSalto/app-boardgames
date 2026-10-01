import type { Game } from '../domain/game.ts'
import type { GameCatalogRepository } from './gameCatalogRepository.ts'

export type GameSearch = (query: string) => Promise<readonly Game[]>

export const normalizeGameQuery = (value: string) => value.trim().replace(/\s+/g, ' ')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')

export const searchGames = async (
  repository: GameCatalogRepository,
  query: string,
  limit = 8,
): Promise<readonly Game[]> => {
  const needle = normalizeGameQuery(query)
  if (!needle || limit <= 0) return []
  const games = await repository.list()
  return games.filter((game) => [game.name, ...(game.aliases ?? [])]
    .some((name) => normalizeGameQuery(name).includes(needle)))
    .sort((first, second) => first.name.localeCompare(second.name, 'es'))
    .slice(0, Math.floor(limit))
}
