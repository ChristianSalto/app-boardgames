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
    trust: {
      averageRating: 4.8,
      ratingCount: 26,
      gamesPlayed: 18,
      attendedGames: 17,
      noShows: 1,
      highlights: ['Puntual', 'Buen ambiente', 'Respeta las reglas'],
      reviews: [
        { id: 'review-alex-1', authorName: 'Lucía S.', rating: 5, game: 'Terraforming Mars', comment: 'Buen ambiente y explicó el juego perfectamente.' },
        { id: 'review-alex-2', authorName: 'Diego R.', rating: 4, game: 'Azul', comment: 'Todo bien. Llegó algo tarde pero avisó.' },
      ],
    },
  },
  {
    id: 'lucia',
    name: 'Lucía Santos',
    city: 'Madrid',
    zone: 'Centro',
    description: 'Organizo mesas abiertas y explico las reglas antes de empezar.',
    trust: {
      averageRating: 4.9,
      ratingCount: 31,
      gamesPlayed: 24,
      attendedGames: 24,
      noShows: 0,
      highlights: ['Explica bien', 'Acogedora', 'Organización clara'],
      reviews: [
        { id: 'review-lucia-1', authorName: 'Marcos R.', rating: 5, game: 'Root', comment: 'Hizo que todo el grupo se sintiera cómodo y explicó muy bien.' },
        { id: 'review-lucia-2', authorName: 'Nadia L.', rating: 3, game: '7 Wonders', comment: 'La partida estuvo bien, aunque la organización podría haber sido más clara.' },
      ],
    },
  },
  {
    id: 'diego',
    name: 'Diego Romero',
    city: 'Madrid',
    zone: 'Retiro',
    description: 'Disfruto los juegos tácticos y conocer grupos nuevos.',
    trust: {
      averageRating: 4.5,
      ratingCount: 12,
      gamesPlayed: 14,
      attendedGames: 13,
      noShows: 1,
      highlights: ['Amable', 'Competitivo con respeto'],
      reviews: [
        { id: 'review-diego-1', authorName: 'Sara V.', rating: 4, game: 'Azul', comment: 'Partida agradable y buen trato con quienes estaban aprendiendo.' },
      ],
    },
  },
  {
    id: 'sara',
    name: 'Sara Vega',
    city: 'Madrid',
    zone: 'Arganzuela',
    description: 'Me gustan los euros medios y aprender juegos nuevos.',
    trust: {
      averageRating: 4.7,
      ratingCount: 9,
      gamesPlayed: 10,
      attendedGames: 10,
      noShows: 0,
      highlights: ['Puntual', 'Buena compañera de mesa'],
      reviews: [
        { id: 'review-sara-1', authorName: 'Irene G.', rating: 5, game: 'Wingspan', comment: 'Muy agradable y atenta durante toda la explicación.' },
      ],
    },
  },
  {
    id: 'javier',
    name: 'Javier Molina',
    city: 'Madrid',
    zone: 'Moncloa',
    description: 'Busco partidas relajadas entre semana.',
    trust: {
      averageRating: 4.2,
      ratingCount: 6,
      gamesPlayed: 8,
      attendedGames: 7,
      noShows: 1,
      highlights: ['Trato cercano', 'Juego tranquilo'],
      reviews: [
        { id: 'review-javier-1', authorName: 'Alex M.', rating: 4, game: 'Dune: Imperium', comment: 'Buen compañero de mesa; confirmó los horarios con antelación.' },
      ],
    },
  },
  {
    id: 'irene',
    name: 'Irene Gil',
    city: 'Madrid',
    zone: 'Salamanca',
    description: 'Prefiero partidas estratégicas y grupos pequeños.',
    trust: {
      averageRating: 4.6,
      ratingCount: 18,
      gamesPlayed: 21,
      attendedGames: 20,
      noShows: 1,
      highlights: ['Respeta los turnos', 'Explica bien'],
      reviews: [
        { id: 'review-irene-1', authorName: 'Lucía S.', rating: 5, game: 'Brass: Birmingham', comment: 'Muy buena partida y comunicación clara antes de quedar.' },
      ],
    },
  },
  {
    id: 'nadia',
    name: 'Nadia López',
    city: 'Madrid',
    zone: 'Getafe',
    description: 'Siempre llevo algún juego fácil de enseñar.',
    trust: {
      averageRating: 4.8,
      ratingCount: 15,
      gamesPlayed: 16,
      attendedGames: 16,
      noShows: 0,
      highlights: ['Ayuda a aprender', 'Buen ambiente'],
      reviews: [
        { id: 'review-nadia-1', authorName: 'Diego R.', rating: 5, game: 'Wingspan', comment: 'Explicación clara, ritmo tranquilo y muy buen ambiente.' },
      ],
    },
  },
  {
    id: 'marcos',
    name: 'Marcos Ruiz',
    city: 'Madrid',
    zone: 'Alcobendas',
    description: 'Jugador habitual de euros y juegos de cartas.',
    trust: {
      averageRating: 4.3,
      ratingCount: 11,
      gamesPlayed: 19,
      attendedGames: 17,
      noShows: 2,
      highlights: ['Conoce muchos juegos', 'Partidas ágiles'],
      reviews: [
        { id: 'review-marcos-1', authorName: 'Alex M.', rating: 3, game: 'Ark Nova', comment: 'La partida fue entretenida, pero faltó concretar mejor la hora de inicio.' },
      ],
    },
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
    place: 'Café Manuela',
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
    place: 'Café Comercial',
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
    place: 'La Mesa de Retiro',
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
    place: 'Centro cultural Casa del Reloj',
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
    place: 'Cafetería Plaza',
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
    place: 'Club Dados y Café',
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
    place: 'Centro cultural Moncloa',
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
    place: 'Casa de las Asociaciones',
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
