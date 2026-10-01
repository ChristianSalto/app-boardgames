import assert from 'node:assert/strict'
import test from 'node:test'
import { gameFieldsForSelection, gameFieldsForUpdateSelection, gameSelectionForStoredGame, matchesCatalogGame } from '../src/games/application/gameSelection.ts'
import { cacheGameCatalog, listGames } from '../src/games/application/gameCatalogRepository.ts'
import { isValidGameId, isValidGameName, MAX_GAME_NAME_LENGTH } from '../src/games/domain/game.ts'
import { gameOptions } from '../src/mock-data/prototypeData.ts'
import { catalogGames } from './fixtures/catalogGames.ts'

test('local catalog fixtures cover the current session select with stable internal IDs', () => {
  assert.deepEqual(catalogGames.map((game) => game.name), [...gameOptions])
  assert.equal(new Set(catalogGames.map((game) => game.id)).size, catalogGames.length)
  assert.ok(catalogGames.every((game) => isValidGameId(game.id) && isValidGameName(game.name)))
})

test('a game selection keeps catalog identity and name together', () => {
  assert.deepEqual(gameFieldsForSelection({ kind: 'cataloged', id: 'azul', name: 'Azul' }), {
    game: 'Azul', gameId: 'azul',
  })
  assert.deepEqual(gameFieldsForSelection({ kind: 'uncataloged', name: 'Juego local' }), {
    game: 'Juego local',
  })
  assert.equal(isValidGameId('Azul'), false)
  assert.equal(isValidGameId(''), false)
  assert.deepEqual(gameSelectionForStoredGame({ game: 'Azul', gameId: 'azul' }), { kind: 'cataloged', id: 'azul', name: 'Azul' })
  assert.deepEqual(gameSelectionForStoredGame({ game: 'Juego antiguo' }), { kind: 'uncataloged', name: 'Juego antiguo' })
  assert.deepEqual(gameFieldsForUpdateSelection({ kind: 'uncataloged', name: 'Azul' }), { game: 'Azul', gameId: null })
  assert.equal(matchesCatalogGame({ id: 'azul', name: 'Azul' }, 'azul', 'Azul'), true)
  assert.equal(matchesCatalogGame({ id: 'azul', name: 'Azul' }, 'azul', 'Root'), false)
})

test('uncataloged game names use the same length boundary as the form and repository', () => {
  assert.equal(isValidGameName('X'.repeat(MAX_GAME_NAME_LENGTH)), true)
  assert.equal(isValidGameName('X'.repeat(MAX_GAME_NAME_LENGTH + 1)), false)
  assert.equal(isValidGameName('   '), false)
})

test('catalog cache reuses one load and retries after a failed load', async () => {
  let calls = 0
  const repository = cacheGameCatalog({ list: async () => {
    calls += 1
    if (calls === 1) throw new Error('offline')
    return catalogGames
  } })
  await assert.rejects(repository.list(), /offline/)
  assert.deepEqual(await repository.list(), catalogGames)
  assert.deepEqual(await repository.list(), catalogGames)
  assert.equal(calls, 2)
})

test('catalog access is expressed by an Application port', async () => {
  const games = await listGames({ list: async () => catalogGames })
  assert.deepEqual(games, catalogGames)
})
