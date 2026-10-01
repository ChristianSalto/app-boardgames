import assert from 'node:assert/strict'
import test from 'node:test'
import { clearExploreFilters, matchesExploreGame, readExploreGameFilter, writeExploreGameFilter } from '../src/game-sessions/exploreGameFilter.ts'
import { searchGames } from '../src/games/application/searchGames.ts'
const cataloged = { kind: 'cataloged', id: 'catan', name: 'Catan' } as const

test('cataloged identity wins over display name', () => {
  assert.equal(matchesExploreGame({game:'Old title',gameId:'catan'},cataloged),true)
  assert.equal(matchesExploreGame({game:'Catan',gameId:'other'},cataloged),false)
})
test('only historical names receive normalized exact matching', () => {
  assert.equal(matchesExploreGame({game:'  CATÁN  '},cataloged),true)
  assert.equal(matchesExploreGame({game:'Catan casero'},cataloged),false)
})
test('uncataloged keeps previous case-insensitive substring behavior', () => {
  const selection = {kind:'uncataloged',name:'  cat  '} as const
  assert.equal(matchesExploreGame({game:'Catan casero'},selection),true)
  assert.equal(matchesExploreGame({game:'Catan',gameId:'other'},selection),true)
  assert.equal(matchesExploreGame({game:'Azul'},selection),false)
  assert.equal(matchesExploreGame({game:'Azul'},null),true)
})
test('legacy URL remains textual even when a catalog game is available', () => {
  const params = new URLSearchParams('game=cat')
  assert.deepEqual(readExploreGameFilter(params,{id:'catan',name:'Catan'}),{kind:'uncataloged',name:'cat'})
  assert.equal(params.toString(),'game=cat')
})
test('new URL roundtrips and loaded catalog canonical name is used', () => {
  const params = writeExploreGameFilter(new URLSearchParams('zone=Centro&date=today&keep=1'),cataloged)
  assert.deepEqual(readExploreGameFilter(params),cataloged)
  assert.deepEqual(readExploreGameFilter(new URLSearchParams(params.toString()),{id:'catan',name:'Catan'}),cataloged)
  assert.equal(params.get('zone'),'Centro')
  assert.equal(params.get('date'),'today')
  assert.equal(params.get('keep'),'1')
  assert.deepEqual(readExploreGameFilter(new URLSearchParams('game=alias&gameId=catan'),{id:'catan',name:'Catan'}),cataloged)
})
test('unknown, failed or invalid ID degrades to text without rewriting the URL', () => {
  for(const id of ['missing','INVALID']) {
    const params = new URLSearchParams({game:'cat',gameId:id})
    assert.deepEqual(readExploreGameFilter(params,null),{kind:'uncataloged',name:'cat'})
    assert.equal(params.get('gameId'),id)
  }
  assert.equal(readExploreGameFilter(new URLSearchParams()),null)
  assert.equal(readExploreGameFilter(new URLSearchParams('gameId=missing'),null),null)
})
test('clearing one/all filters preserves unrelated params and removes stale identity', () => {
  const original = new URLSearchParams('game=Catan&gameId=catan&date=today&zone=Centro&keep=1')
  assert.equal(writeExploreGameFilter(original,null).toString(),'date=today&zone=Centro&keep=1')
  assert.equal(writeExploreGameFilter(original,{kind:'uncataloged',name:'Az'}).get('gameId'),null)
  assert.equal(clearExploreFilters(original).toString(),'keep=1')
  assert.equal(original.get('gameId'),'catan')
})
test('alias result produces canonical identity, never alias identity', async () => {
  const [game] = await searchGames({list:async()=>[{id:'ticket-to-ride',name:'Ticket to Ride',aliases:['Aventureros al Tren']}]},'Aventureros')
  assert.ok(game)
  const selected = {kind:'cataloged',id:game.id,name:game.name} as const
  assert.equal(matchesExploreGame({game:'Old name',gameId:'ticket-to-ride'},selected),true)
  assert.equal(writeExploreGameFilter(new URLSearchParams(),selected).get('game'),'Ticket to Ride')
})
