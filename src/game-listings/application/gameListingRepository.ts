import type { GameListing, GameListingId, PlayerId } from '../domain/gameListing.ts'

export type DiscoverGameListingsCriteria = Readonly<{
  city: string
  limit?: number
}>

export type GameListingRepository = Readonly<{
  create: (listing: GameListing) => Promise<GameListing>
  discoverActive: (criteria: DiscoverGameListingsCriteria) => Promise<readonly GameListing[]>
  getById: (id: GameListingId) => Promise<GameListing | null>
  getByOwnerId: (ownerId: PlayerId) => Promise<readonly GameListing[]>
  updateActive: (listing: GameListing) => Promise<GameListing>
  close: (listing: GameListing) => Promise<GameListing>
}>
