export type SessionLifecycle = 'scheduled' | 'cancelled'
export type RequestState = 'pending' | 'declined' | 'not-confirmed'
export type SessionTone = 'terracotta' | 'forest' | 'mustard' | 'blue' | 'plum'

export type ParticipationRequest = {
  readonly playerId: string
  readonly state: RequestState
}

export type GameSession = {
  readonly id: string
  readonly game: string
  readonly startsAt: string
  readonly city: string
  readonly zone: string
  readonly organizerId: string
  readonly capacity: number
  readonly description: string
  readonly participantIds: readonly string[]
  readonly requests: readonly ParticipationRequest[]
  readonly lifecycle: SessionLifecycle
  readonly tone: SessionTone
}

export type CreateSessionInput = {
  readonly game: string
  readonly date: string
  readonly time: string
  readonly zone: string
  readonly capacity: number
  readonly description: string
}

export type DateFilter = 'all' | 'today' | 'seven-days' | 'weekend'
export type SessionDisplayState = 'open' | 'complete' | 'cancelled' | 'past'
export type UserRelation =
  | 'organizer'
  | 'confirmed'
  | 'pending'
  | 'declined'
  | 'not-confirmed'
  | 'none'
