import assert from 'node:assert/strict'
import test from 'node:test'
import { searchGames } from '../src/games/application/searchGames.ts'
import { searchCatalogGames } from './fixtures/catalogGames.ts'

const repository = { list: async () => searchCatalogGames }

test('search matches canonical names, case, whitespace and accents', async () => {
  assert.deepEqual((await searchGames(repository, '  TICKET   TO  RIDE  ')).map((game) => game.id), ['ticket-to-ride'])
  assert.deepEqual((await searchGames(repository, 'DÚNE')).map((game) => game.id), ['dune-imperium'])
})

test('an alias finds the cataloged identity without becoming its display name', async () => {
  assert.deepEqual(await searchGames(repository, '  aventureros al tren '), [searchCatalogGames[8]])
})

test('search has a bounded result set and skips empty queries', async () => {
  assert.equal((await searchGames(repository, 'a', 2)).length, 2)
  assert.deepEqual(await searchGames(repository, '  '), [])
  assert.deepEqual(await searchGames(repository, 'a', 0), [])
})
