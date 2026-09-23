import assert from 'node:assert/strict'
import test from 'node:test'
import {
  closeGameListing,
  createGameListing,
  createGameListingWithImage,
  discoverGameListings,
  getMyGameListings,
  updateGameListing,
} from '../src/game-listings/application/gameListings.ts'
import {
  acceptListingInterest,
  declineListingInterest,
  expressListingInterest,
  getListingInterestsForOwner,
} from '../src/game-listings/application/listingInterests.ts'
import { createListingOperationFailure } from '../src/game-listings/application/listingOperationFailure.ts'
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

test('solo el propietario puede resolver intereses pendientes de su anuncio', async () => {
  const store = createInMemoryGameListingStore()
  await expressListingInterest(
    store.gameListingRepository,
    store.listingInterestRepository,
    'listing-wingspan',
    'player-b',
    dependencies.now,
  )

  const outsiderView = await getListingInterestsForOwner(
    store.gameListingRepository,
    store.listingInterestRepository,
    'listing-wingspan',
    'player-b',
  )
  assert.deepEqual(outsiderView, [])

  const unauthorizedResolution = await acceptListingInterest(
    store.gameListingRepository,
    store.listingInterestRepository,
    'listing-wingspan',
    'player-b',
    'player-b',
  )
  assert.deepEqual(unauthorizedResolution, { ok: false, error: 'not-listing-owner' })

  const accepted = await acceptListingInterest(
    store.gameListingRepository,
    store.listingInterestRepository,
    'listing-wingspan',
    'player-b',
    'lucia',
  )
  assert.deepEqual(accepted, {
    ok: true,
    value: { listingId: 'listing-wingspan', playerId: 'player-b', status: 'accepted', createdAt: dependencies.now() },
  })

  await expressListingInterest(
    store.gameListingRepository,
    store.listingInterestRepository,
    'listing-root',
    'player-c',
    dependencies.now,
  )
  const declined = await declineListingInterest(
    store.gameListingRepository,
    store.listingInterestRepository,
    'listing-root',
    'player-c',
    'diego',
  )
  assert.equal(declined.ok, true)
  if (!declined.ok) return
  assert.equal(declined.value.status, 'declined')
})

test('la creación con imagen conserva el error de infraestructura y limpia la imagen si Firestore falla', async () => {
  const store = createInMemoryGameListingStore()
  const uploadFailure = await createGameListingWithImage(
    store.gameListingRepository,
    {
      uploadCover: async () => { throw createListingOperationFailure('image-upload-failed') },
      deleteCover: async () => undefined,
    },
    { ...input, imageUrl: undefined },
    { bytes: new Uint8Array([1]), contentType: 'image/png' },
    'owner-a',
    dependencies,
  )
  assert.deepEqual(uploadFailure, { ok: false, error: 'image-upload-failed' })

  let deleted = false
  const persistenceFailure = await createGameListingWithImage(
    { ...store.gameListingRepository, create: async () => { throw createListingOperationFailure('listing-persistence-failed') } },
    {
      uploadCover: async () => 'https://example.test/brass.png',
      deleteCover: async () => { deleted = true },
    },
    { ...input, imageUrl: undefined },
    { bytes: new Uint8Array([1]), contentType: 'image/png' },
    'owner-a',
    dependencies,
  )
  assert.deepEqual(persistenceFailure, { ok: false, error: 'listing-persistence-failed' })
  assert.equal(deleted, true)
})
