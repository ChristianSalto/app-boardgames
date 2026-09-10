export type PlayerReview = {
  readonly id: string
  readonly authorName: string
  readonly rating: 3 | 4 | 5
  readonly comment: string
  readonly game: string
}

export type PlayerTrustSignals = {
  readonly averageRating: number
  readonly ratingCount: number
  readonly gamesPlayed: number
  readonly attendedGames: number
  readonly noShows: number
  readonly highlights: readonly string[]
  readonly reviews: readonly PlayerReview[]
}

export type Player = {
  readonly id: string
  readonly displayName: string
  readonly city: string
  readonly district?: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly trust?: PlayerTrustSignals
}

export type CreatePlayerInput = {
  readonly id: string
  readonly displayName: string
  readonly city: 'Madrid'
  readonly district?: string
  readonly description?: string
}
