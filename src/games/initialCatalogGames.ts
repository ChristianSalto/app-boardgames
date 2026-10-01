import type { Game } from './domain/game.ts'

// Stable Mesa Abierta document IDs. A visible name change must never rename an ID.
export const initialCatalogGames: readonly Game[] = [
  { id: 'terraforming-mars', name: 'Terraforming Mars' },
  { id: 'dune-imperium', name: 'Dune: Imperium' },
  { id: 'wingspan', name: 'Wingspan' },
  { id: 'azul', name: 'Azul' },
  { id: 'root', name: 'Root' },
  { id: 'brass-birmingham', name: 'Brass: Birmingham' },
  { id: '7-wonders', name: '7 Wonders' },
  { id: 'ark-nova', name: 'Ark Nova' },
]
