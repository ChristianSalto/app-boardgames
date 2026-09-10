import type { ParticipationRequest } from '../types'

export type ParticipationRequestRepository = Readonly<{
  requestParticipation: (sessionId: string, playerId: string) => Promise<void>
  getParticipationForPlayer: (playerId: string) => Promise<readonly ParticipationRequest[]>
  getPendingRequestsForSession: (sessionId: string) => Promise<readonly ParticipationRequest[]>
  acceptParticipationRequest: (
    sessionId: string,
    playerId: string,
    organizerId: string,
  ) => Promise<void>
  rejectParticipationRequest: (
    sessionId: string,
    playerId: string,
    organizerId: string,
  ) => Promise<void>
}>

export const requestParticipation = (
  repository: ParticipationRequestRepository,
  sessionId: string,
  playerId: string,
) => repository.requestParticipation(sessionId, playerId)

export const getParticipationForPlayer = (
  repository: ParticipationRequestRepository,
  playerId: string,
) => repository.getParticipationForPlayer(playerId)

export const getPendingRequestsForSession = (
  repository: ParticipationRequestRepository,
  sessionId: string,
) => repository.getPendingRequestsForSession(sessionId)

export const acceptParticipationRequest = (
  repository: ParticipationRequestRepository,
  sessionId: string,
  playerId: string,
  organizerId: string,
) => repository.acceptParticipationRequest(sessionId, playerId, organizerId)

export const rejectParticipationRequest = (
  repository: ParticipationRequestRepository,
  sessionId: string,
  playerId: string,
  organizerId: string,
) => repository.rejectParticipationRequest(sessionId, playerId, organizerId)
