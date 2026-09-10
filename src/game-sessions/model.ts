import type {
  CreateSessionInput,
  DateFilter,
  GameSession,
  SessionDisplayState,
  SessionTone,
  UserRelation,
} from './types'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
})

export const getRemainingSeats = (session: GameSession) =>
  Math.max(0, session.capacity - session.participantIds.length)

export const getSessionDisplayState = (
  session: GameSession,
  now = new Date(),
): SessionDisplayState => {
  if (session.lifecycle === 'cancelled') return 'cancelled'
  if (new Date(session.startsAt).getTime() <= now.getTime()) return 'past'
  if (getRemainingSeats(session) === 0) return 'complete'
  return 'open'
}

export const isSessionAvailable = (session: GameSession, now = new Date()) =>
  getSessionDisplayState(session, now) === 'open'

export const getUserRelation = (
  session: GameSession,
  playerId: string,
): UserRelation => {
  if (session.organizerId === playerId) return 'organizer'
  if (session.participantIds.includes(playerId)) return 'confirmed'

  const request = session.requests.find((item) => item.playerId === playerId)
  return request?.state ?? 'none'
}

export const requestParticipation = (
  session: GameSession,
  playerId: string,
): GameSession => {
  if (
    !isSessionAvailable(session) ||
    getUserRelation(session, playerId) !== 'none'
  ) {
    return session
  }

  return {
    ...session,
    requests: [...session.requests, { playerId, state: 'pending' }],
  }
}

export const acceptParticipation = (
  session: GameSession,
  playerId: string,
): GameSession => {
  const request = session.requests.find(
    (item) => item.playerId === playerId && item.state === 'pending',
  )

  if (!request || getRemainingSeats(session) === 0) return session

  const participantIds = [...session.participantIds, playerId]
  const isNowComplete = participantIds.length >= session.capacity
  const requests = session.requests
    .filter((item) => item.playerId !== playerId)
    .map((item) =>
      isNowComplete && item.state === 'pending'
        ? { ...item, state: 'not-confirmed' as const }
        : item,
    )

  return { ...session, participantIds, requests }
}

export const declineParticipation = (
  session: GameSession,
  playerId: string,
): GameSession => ({
  ...session,
  requests: session.requests.map((item) =>
    item.playerId === playerId && item.state === 'pending'
      ? { ...item, state: 'declined' }
      : item,
  ),
})

export const createGameSession = (
  input: CreateSessionInput,
  organizerId: string,
  id: string,
  tone: SessionTone,
): GameSession => ({
  id,
  game: input.game,
  startsAt: new Date(`${input.date}T${input.time}:00`).toISOString(),
  city: 'Madrid',
  zone: input.zone,
  place: input.place.trim(),
  organizerId,
  capacity: input.capacity,
  description: input.description.trim(),
  participantIds: [organizerId],
  requests: [],
  lifecycle: 'scheduled',
  tone,
})

export const formatSessionDate = (startsAt: string) =>
  dateFormatter.format(new Date(startsAt)).replace('.', '')

export const formatSessionLongDate = (startsAt: string) =>
  longDateFormatter.format(new Date(startsAt))

export const formatSessionTime = (startsAt: string) =>
  timeFormatter.format(new Date(startsAt))

export const sortSessionsByDate = (sessions: readonly GameSession[]) =>
  [...sessions].sort(
    (first, second) =>
      new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime(),
  )

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()

export const matchesDateFilter = (
  startsAt: string,
  filter: DateFilter,
  now = new Date(),
) => {
  if (filter === 'all') return true

  const date = new Date(startsAt)
  if (filter === 'today') return isSameDay(date, now)

  const distance = date.getTime() - now.getTime()
  const isWithinSevenDays = distance >= 0 && distance <= 7 * 24 * 60 * 60 * 1000
  if (filter === 'seven-days') return isWithinSevenDays

  return isWithinSevenDays && (date.getDay() === 0 || date.getDay() === 6)
}

export const getGameInitials = (game: string) =>
  game
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || game.slice(0, 2).toUpperCase()
