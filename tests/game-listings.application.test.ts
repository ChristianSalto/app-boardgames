import assert from 'node:assert/strict'
import test from 'node:test'
import {
  closeGameListing,
  createGameListing,
  discoverGameListings,
  getMyGameListings,
  updateGameListing,
} from '../src/game-listings/application/gameListings.ts'
import { expressListingInterest } from '../src/game-listings/application/listingInterests.ts'
import { createInMemoryGameListingStore } from '../src/game-listings/infrastructure/inMemoryGameListingStore.ts'

const input = {
  gameName: 'Brass: Birmingham',
  imageUrl: 'https://example.test/brass.jpg',
  description: 'Completo, con muy poco uso.',
  condition: 'good' as const,
  listingType: 'sale' as const,
  priceInCents: 3600,
  city: 'Madrid',
  district: 'Chamberí',
}

const dependencies = {
  createId: () => 'listing-owner-a',
  now: () => '2026-09-12T12:00:00.000Z',
}

test('el repositorio en memoria conecta crear, editar, cerrar y descubrir sin persistencia externa', async () => {
  const store = createInMemoryGameListingStore()
  const created = await createGameListing(store.gameListingRepository, input, 'owner-a', dependencies)
  assert.equal(created.ok, true)
  if (!created.ok) return

  const discoveredAfterCreate = await discoverGameListings(store.gameListingRepository, 'Madrid')
  assert.ok(discoveredAfterCreate.some((listing) => listing.id === created.value.id))

  const updated = await updateGameListing(
    store.gameListingRepository,
    created.value.id,
    { ...input, gameName: 'Brass: Birmingham Deluxe' },
    'owner-a',
  )
  assert.equal(updated.ok, true)
  if (!updated.ok) return
  assert.equal(updated.value.gameName, 'Brass: Birmingham Deluxe')

  const closed = await closeGameListing(store.gameListingRepository, created.value.id, 'owner-a')
  assert.equal(closed.ok, true)
  const discoveredAfterClose = await discoverGameListings(store.gameListingRepository, 'Madrid')
  assert.equal(discoveredAfterClose.some((listing) => listing.id === created.value.id), false)
  const mine = await getMyGameListings(store.gameListingRepository, 'owner-a')
  assert.equal(mine[0]?.status, 'closed')
})

test('el interés se guarda en memoria como pendiente y no se duplica', async () => {
  const store = createInMemoryGameListingStore()
  const first = await expressListingInterest(
    store.gameListingRepository,
    store.listingInterestRepository,
    'listing-wingspan',
    'player-b',
    dependencies.now,
  )
  assert.equal(first.ok, true)
  if (!first.ok) return
  assert.equal(first.value.status, 'pending')

  const duplicate = await expressListingInterest(
    store.gameListingRepository,
    store.listingInterestRepository,
    'listing-wingspan',
    'player-b',
    dependencies.now,
  )
  assert.deepEqual(duplicate, { ok: false, error: 'interest-already-expressed' })
})
