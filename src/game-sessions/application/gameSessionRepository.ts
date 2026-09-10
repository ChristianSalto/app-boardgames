import type { CreateSessionInput, GameSession, UpdateSessionInput } from '../types'

export type GameSessionRepository = Readonly<{
  discover: () => Promise<readonly GameSession[]>
  getById: (id: string) => Promise<GameSession | null>
  create: (input: CreateSessionInput, organizerId: string) => Promise<GameSession>
  update: (id: string, input: UpdateSessionInput, organizerId: string) => Promise<GameSession>
  cancel: (id: string, organizerId: string) => Promise<void>
  getOrganizedBy: (organizerId: string) => Promise<readonly GameSession[]>
}>

export const discoverGameSessions = (repository: GameSessionRepository) => repository.discover()
export const getGameSession = (repository: GameSessionRepository, id: string) => repository.getById(id)
export const createGameSession = (repository: GameSessionRepository, input: CreateSessionInput, organizerId: string) => repository.create(input, organizerId)
export const updateGameSession = (repository: GameSessionRepository, id: string, input: UpdateSessionInput, organizerId: string) =>
  repository.update(id, input, organizerId)
export const cancelGameSession = (repository: GameSessionRepository, id: string, organizerId: string) =>
  repository.cancel(id, organizerId)
export const getOrganizedGameSessions = (repository: GameSessionRepository, organizerId: string) => repository.getOrganizedBy(organizerId)
