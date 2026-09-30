import type { Game } from '../../src/games/domain/game.ts'

export const catalogGames: readonly Game[] = [
  { id: 'terraforming-mars', name: 'Terraforming Mars' },
  { id: 'dune-imperium', name: 'Dune: Imperium' },
  { id: 'wingspan', name: 'Wingspan' },
  { id: 'azul', name: 'Azul' },
  { id: 'root', name: 'Root' },
  { id: 'brass-birmingham', name: 'Brass: Birmingham' },
  { id: '7-wonders', name: '7 Wonders' },
  { id: 'ark-nova', name: 'Ark Nova' },
]

export const searchCatalogGames: readonly Game[] = [
  ...catalogGames,
  { id: 'ticket-to-ride', name: 'Ticket to Ride', aliases: ['Aventureros al Tren'] },
]
