import assert from 'node:assert/strict'
import test from 'node:test'
import { gameFieldsForSelection } from '../src/games/application/gameSelection.ts'
import { listGames } from '../src/games/application/gameCatalogRepository.ts'
import { isValidGameId, isValidGameName } from '../src/games/domain/game.ts'
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
})

test('catalog access is expressed by an Application port', async () => {
  const games = await listGames({ list: async () => catalogGames })
  assert.deepEqual(games, catalogGames)
})
