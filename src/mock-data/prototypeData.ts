import type { Player } from '../players/types'

export const initialPlayers: readonly Player[] = [
  {
    id: 'alex',
    displayName: 'Alex Martín',
    city: 'Madrid',
    district: 'Chamberí',
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
    displayName: 'Lucía Santos',
    city: 'Madrid',
    district: 'Centro',
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
    displayName: 'Diego Romero',
    city: 'Madrid',
    district: 'Retiro',
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
    displayName: 'Sara Vega',
    city: 'Madrid',
    district: 'Arganzuela',
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
    displayName: 'Javier Molina',
    city: 'Madrid',
    district: 'Moncloa',
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
    displayName: 'Irene Gil',
    city: 'Madrid',
    district: 'Salamanca',
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
    displayName: 'Nadia López',
    city: 'Madrid',
    district: 'Getafe',
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
    displayName: 'Marcos Ruiz',
    city: 'Madrid',
    district: 'Alcobendas',
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
