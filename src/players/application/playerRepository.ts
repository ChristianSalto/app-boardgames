import type { CreatePlayerInput, Player } from '../types'

export type PlayerRepository = Readonly<{
  getById: (id: string) => Promise<Player | null>
  create: (input: CreatePlayerInput) => Promise<Player>
}>

export const getPlayerById = (repository: PlayerRepository, id: string) =>
  repository.getById(id)

export const createPlayer = (repository: PlayerRepository, input: CreatePlayerInput) =>
  repository.create(input)
