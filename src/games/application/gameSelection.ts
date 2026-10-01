import type { GameId } from '../domain/game.ts'
import type { Game } from '../domain/game.ts'

export type GameSelection =
  | Readonly<{ kind: 'cataloged'; id: GameId; name: string }>
  | Readonly<{ kind: 'uncataloged'; name: string }>

export const gameFieldsForSelection = (selection: GameSelection) => ({
  game: selection.name,
  ...(selection.kind === 'cataloged' ? { gameId: selection.id } : {}),
})

export const gameFieldsForUpdateSelection = (selection: GameSelection) => ({
  game: selection.name,
  gameId: selection.kind === 'cataloged' ? selection.id : null,
})

export const gameSelectionForStoredGame = (stored: Readonly<{ game: string; gameId?: GameId }>): GameSelection =>
  stored.gameId
    ? { kind: 'cataloged', id: stored.gameId, name: stored.game }
    : { kind: 'uncataloged', name: stored.game }

export const matchesCatalogGame = (game: Pick<Game, 'id' | 'name'> | null, id: GameId, name: string) =>
  game?.id === id && game.name === name
