import type { GameId } from '../domain/game.ts'

export type GameSelection =
  | Readonly<{ kind: 'cataloged'; id: GameId; name: string }>
  | Readonly<{ kind: 'uncataloged'; name: string }>

export const gameFieldsForSelection = (selection: GameSelection) => ({
  game: selection.name,
  ...(selection.kind === 'cataloged' ? { gameId: selection.id } : {}),
})
