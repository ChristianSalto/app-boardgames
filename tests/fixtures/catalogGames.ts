import type { Game } from '../../src/games/domain/game.ts'
import { initialCatalogGames } from '../../src/games/initialCatalogGames.ts'

export const catalogGames: readonly Game[] = initialCatalogGames

export const searchCatalogGames: readonly Game[] = [
  ...catalogGames,
  { id: 'ticket-to-ride', name: 'Ticket to Ride', aliases: ['Aventureros al Tren'] },
]
