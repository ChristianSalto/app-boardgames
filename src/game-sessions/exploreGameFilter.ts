import type { Game } from '../games/domain/game.ts'
import { isValidGameId } from '../games/domain/game.ts'
import type { GameSelection } from '../games/application/gameSelection.ts'
import { normalizeGameQuery } from '../games/application/searchGames.ts'

export const readExploreGameFilter = (params: URLSearchParams, resolved?: Game | null): GameSelection | null => {
  const name = params.get('game') ?? ''
  const id = params.get('gameId') ?? ''
  if (id && isValidGameId(id)) {
    if (resolved?.id === id) return { kind: 'cataloged', id, name: resolved.name }
    // The URL pair is usable while the shared catalog loads; failures fall back to text.
    if (resolved === undefined && name.trim()) return { kind: 'cataloged', id, name }
  }
  return name ? { kind: 'uncataloged', name } : null
}

export const writeExploreGameFilter = (params: URLSearchParams, selection: GameSelection | null) => {
  const next = new URLSearchParams(params)
  next.delete('game')
  next.delete('gameId')
  if (selection?.name) next.set('game', selection.name)
  if (selection?.kind === 'cataloged') next.set('gameId', selection.id)
  return next
}

export const clearExploreFilters = (params: URLSearchParams) => {
  const next = writeExploreGameFilter(params, null)
  next.delete('date')
  next.delete('zone')
  return next
}

export const matchesExploreGame = (session: Readonly<{ game: string; gameId?: string }>, selection: GameSelection | null) => {
  if (!selection) return true
  if (selection.kind === 'cataloged') {
    return session.gameId ? session.gameId === selection.id
      : normalizeGameQuery(session.game) === normalizeGameQuery(selection.name)
  }
  return session.game.toLocaleLowerCase('es-ES').includes(selection.name.trim().toLocaleLowerCase('es-ES'))
}
