import type { Player } from '../players/types'

export const initialPlayers: readonly Player[] = [
  {
    id: 'alex',
    displayName: 'Alex Martín',
    city: 'Madrid',
    district: 'Chamberí',
    description: 'Me gustan los juegos de estrategia y las partidas tranquilas.',
  },
  {
    id: 'lucia',
    displayName: 'Lucía Santos',
    city: 'Madrid',
    district: 'Centro',
    description: 'Organizo mesas abiertas y explico las reglas antes de empezar.',
  },
  {
    id: 'diego',
    displayName: 'Diego Romero',
    city: 'Madrid',
    district: 'Retiro',
    description: 'Disfruto los juegos tácticos y conocer grupos nuevos.',
  },
  {
    id: 'sara',
    displayName: 'Sara Vega',
    city: 'Madrid',
    district: 'Arganzuela',
    description: 'Me gustan los euros medios y aprender juegos nuevos.',
  },
  {
    id: 'javier',
    displayName: 'Javier Molina',
    city: 'Madrid',
    district: 'Moncloa',
    description: 'Busco partidas relajadas entre semana.',
  },
  {
    id: 'irene',
    displayName: 'Irene Gil',
    city: 'Madrid',
    district: 'Salamanca',
    description: 'Prefiero partidas estratégicas y grupos pequeños.',
  },
  {
    id: 'nadia',
    displayName: 'Nadia López',
    city: 'Madrid',
    district: 'Getafe',
    description: 'Siempre llevo algún juego fácil de enseñar.',
  },
  {
    id: 'marcos',
    displayName: 'Marcos Ruiz',
    city: 'Madrid',
    district: 'Alcobendas',
    description: 'Jugador habitual de euros y juegos de cartas.',
  },
]

export const gameOptions = [
  'Terraforming Mars',
  'Dune: Imperium',
  'Wingspan',
  'Azul',
  'Root',
  'Brass: Birmingham',
  '7 Wonders',
  'Ark Nova',
] as const

export const madridZones = [
  'Arganzuela',
  'Centro',
  'Chamberí',
  'Getafe',
  'Moncloa',
  'Retiro',
  'Salamanca',
  'Alcobendas',
] as const
