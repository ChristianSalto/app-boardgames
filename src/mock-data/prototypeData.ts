import type { GameSession, SessionTone } from '../game-sessions/types'
import type { Player } from '../players/types'

export const currentPlayerId = 'alex'

export const initialPlayers: readonly Player[] = [
  {
    id: 'alex',
    name: 'Alex Martín',
    city: 'Madrid',
    zone: 'Chamberí',
    description: 'Me gustan los juegos de estrategia y las partidas tranquilas.',
  },
  {
    id: 'lucia',
    name: 'Lucía Santos',
    city: 'Madrid',
    zone: 'Centro',
    description: 'Organizo mesas abiertas y explico las reglas antes de empezar.',
  },
  {
    id: 'diego',
    name: 'Diego Romero',
    city: 'Madrid',
    zone: 'Retiro',
    description: 'Disfruto los juegos tácticos y conocer grupos nuevos.',
  },
  {
    id: 'sara',
    name: 'Sara Vega',
    city: 'Madrid',
    zone: 'Arganzuela',
    description: 'Me gustan los euros medios y aprender juegos nuevos.',
  },
  {
    id: 'javier',
    name: 'Javier Molina',
    city: 'Madrid',
    zone: 'Moncloa',
    description: 'Busco partidas relajadas entre semana.',
  },
  {
    id: 'irene',
    name: 'Irene Gil',
    city: 'Madrid',
    zone: 'Salamanca',
    description: 'Prefiero partidas estratégicas y grupos pequeños.',
  },
  {
    id: 'nadia',
    name: 'Nadia López',
    city: 'Madrid',
    zone: 'Getafe',
    description: 'Siempre llevo algún juego fácil de enseñar.',
  },
  {
    id: 'marcos',
    name: 'Marcos Ruiz',
    city: 'Madrid',
    zone: 'Alcobendas',
    description: 'Jugador habitual de euros y juegos de cartas.',
  },
]

const atTime = (daysFromToday: number, hour: number, minutes = 0) => {
  const date = new Date()
  date.setHours(hour, minutes, 0, 0)
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString()
}

const session = (
  value: Omit<GameSession, 'city' | 'lifecycle'> &
    Partial<Pick<GameSession, 'lifecycle'>>,
): GameSession => ({
  city: 'Madrid',
  lifecycle: 'scheduled',
  ...value,
})

export const createInitialSessions = (): readonly GameSession[] => [
  session({
    id: 'terraforming-chamberi',
    game: 'Terraforming Mars',
    startsAt: atTime(2, 19),
    zone: 'Chamberí',
    organizerId: 'lucia',
    capacity: 4,
    description:
      'Partida tranquila y abierta a quien conozca las reglas básicas. Haremos una pausa a mitad.',
    participantIds: ['lucia', 'diego'],
    requests: [],
    tone: 'terracotta',
  }),
  session({
    id: 'dune-centro',
    game: 'Dune: Imperium',
    startsAt: atTime(3, 18, 30),
    zone: 'Centro',
    organizerId: 'alex',
    capacity: 4,
    description:
      'Mesa de nivel intermedio. Explicación breve y partida sin expansiones.',
    participantIds: ['alex', 'irene', 'nadia'],
    requests: [
      { playerId: 'sara', state: 'pending' },
      { playerId: 'javier', state: 'pending' },
    ],
    tone: 'mustard',
  }),
  session({
    id: 'wingspan-retiro',
    game: 'Wingspan',
    startsAt: atTime(4, 17, 30),
    zone: 'Retiro',
    organizerId: 'nadia',
    capacity: 5,
    description: 'Tarde tranquila para jugar la caja base. Enseñamos a jugar.',
    participantIds: ['nadia', 'alex'],
    requests: [],
    tone: 'blue',
  }),
  session({
    id: 'ark-nova-arganzuela',
    game: 'Ark Nova',
    startsAt: atTime(5, 18),
    zone: 'Arganzuela',
    organizerId: 'marcos',
    capacity: 4,
    description: 'Primera partida con la expansión. Calculamos unas tres horas.',
    participantIds: ['marcos', 'lucia'],
    requests: [{ playerId: 'alex', state: 'pending' }],
    tone: 'forest',
  }),
  session({
    id: 'seven-wonders-getafe',
    game: '7 Wonders',
    startsAt: atTime(6, 19, 30),
    zone: 'Getafe',
    organizerId: 'sara',
    capacity: 6,
    description: 'Varias rondas rápidas. No hace falta experiencia previa.',
    participantIds: ['sara', 'javier', 'irene'],
    requests: [],
    tone: 'plum',
  }),
  session({
    id: 'azul-salamanca',
    game: 'Azul',
    startsAt: atTime(7, 17),
    zone: 'Salamanca',
    organizerId: 'diego',
    capacity: 4,
    description: 'Partida completa de iniciación.',
    participantIds: ['diego', 'alex', 'sara', 'javier'],
    requests: [],
    tone: 'blue',
  }),
  session({
    id: 'root-moncloa',
    game: 'Root',
    startsAt: atTime(8, 18),
    zone: 'Moncloa',
    organizerId: 'lucia',
    capacity: 4,
    description: 'La partida ha sido cancelada.',
    participantIds: ['lucia', 'alex'],
    requests: [],
    lifecycle: 'cancelled',
    tone: 'forest',
  }),
  session({
    id: 'brass-alcobendas',
    game: 'Brass: Birmingham',
    startsAt: atTime(-6, 18, 30),
    zone: 'Alcobendas',
    organizerId: 'marcos',
    capacity: 4,
    description: 'Partida ya celebrada.',
    participantIds: ['marcos', 'alex', 'irene'],
    requests: [],
    tone: 'terracotta',
  }),
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

export const prototypeTones: readonly SessionTone[] = [
  'forest',
  'terracotta',
  'mustard',
  'blue',
  'plum',
]
