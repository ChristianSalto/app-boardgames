import type {
  CreateSessionInput,
  DateFilter,
  GameSession,
  SessionDisplayState,
  SessionTone,
  UserRelation,
} from './types'
import { instantToMadridCivil, madridCivilToInstant, madridTimeZoneName } from './madridDateTime.ts'

export const sessionInstantFromMadridCivil = (date: string, time: string) => {
  const result = madridCivilToInstant(date, time)
  if (!result.ok) throw new Error(result.reason)
  return result.instant
}

export const isFutureSessionInput = (
  input: Pick<CreateSessionInput, 'date' | 'time'>,
  now = new Date(),
) => {
  const result = madridCivilToInstant(input.date, input.time)
  return result.ok && new Date(result.instant).getTime() > now.getTime()
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  timeZone: madridTimeZoneName,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('es-ES', {
  timeZone: madridTimeZoneName,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  timeZone: madridTimeZoneName,
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

export const isValidCapacity = (capacity: number) => Number.isInteger(capacity) && capacity >= 2

export const isSessionAvailable = (session: GameSession, now = new Date()) =>
  getSessionDisplayState(session, now) === 'open'

export const getUserRelation = (
  session: GameSession,
  playerId: string,
): UserRelation => {
  if (session.organizerId === playerId) return 'organizer'
  if (session.participantIds.includes(playerId)) return 'confirmed'

  const request = session.requests.find((item) => item.playerId === playerId)
  if (!request) return 'none'
  if (request.status === 'pending') return 'pending'
  if (request.status === 'confirmed') return 'confirmed'
  return getSessionDisplayState(session) === 'complete' ? 'not-confirmed' : 'declined'
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
    requests: [
      ...session.requests,
      { id: `${session.id}_${playerId}`, sessionId: session.id, playerId, status: 'pending' },
    ],
  }
}

export const acceptParticipation = (
  session: GameSession,
  playerId: string,
): GameSession => {
  const request = session.requests.find(
    (item) => item.playerId === playerId && item.status === 'pending',
  )

  if (!request || getRemainingSeats(session) === 0) return session

  const participantIds = [...session.participantIds, playerId]
  const isNowComplete = participantIds.length >= session.capacity
  const requests = session.requests
    .map((item) =>
      item.playerId === playerId
        ? { ...item, status: 'confirmed' as const }
        : isNowComplete && item.status === 'pending'
          ? { ...item, status: 'rejected' as const }
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
    item.playerId === playerId && item.status === 'pending'
      ? { ...item, status: 'rejected' }
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
  startsAt: sessionInstantFromMadridCivil(input.date, input.time),
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

const isSameMadridDay = (first: Date, second: Date) =>
  instantToMadridCivil(first).date === instantToMadridCivil(second).date

export const matchesDateFilter = (
  startsAt: string,
  filter: DateFilter,
  now = new Date(),
) => {
  if (filter === 'all') return true

  const date = new Date(startsAt)
  if (filter === 'today') return isSameMadridDay(date, now)

  const distance = date.getTime() - now.getTime()
  const isWithinSevenDays = distance >= 0 && distance <= 7 * 24 * 60 * 60 * 1000
  if (filter === 'seven-days') return isWithinSevenDays

  const madridDate = instantToMadridCivil(date).date
  const madridDay = new Date(`${madridDate}T00:00:00.000Z`).getUTCDay()
  return isWithinSevenDays && (madridDay === 0 || madridDay === 6)
}

export const getGameInitials = (game: string) =>
  game
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || game.slice(0, 2).toUpperCase()
