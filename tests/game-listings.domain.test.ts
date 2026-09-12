import assert from 'node:assert/strict'
import test from 'node:test'
import {
  closeGameListing,
  createGameListing,
  updateGameListing,
  type GameListingInput,
} from '../src/game-listings/domain/gameListing.ts'
import { expressListingInterest } from '../src/game-listings/domain/listingInterest.ts'

const saleInput: GameListingInput = {
  gameName: 'Wingspan',
  imageUrl: 'https://example.test/wingspan.jpg',
  description: 'Completo y muy cuidado.',
  condition: 'likeNew',
  listingType: 'sale',
  priceInCents: 3200,
  city: 'Madrid',
  district: 'Centro',
}

test('una venta requiere un precio positivo y un intercambio no lo admite', () => {
  const withoutPrice = createGameListing(
    { ...saleInput, priceInCents: undefined },
    'owner-a',
    'listing-a',
    '2026-09-12T12:00:00.000Z',
  )
  const tradeWithPrice = createGameListing(
    { ...saleInput, listingType: 'trade' },
    'owner-a',
    'listing-b',
    '2026-09-12T12:00:00.000Z',
  )

  assert.deepEqual(withoutPrice, { ok: false, error: 'invalid-input' })
  assert.deepEqual(tradeWithPrice, { ok: false, error: 'invalid-input' })
  assert.deepEqual(
    createGameListing({ ...saleInput, imageUrl: 'imagen-sin-url' }, 'owner-a', 'listing-c', '2026-09-12T12:00:00.000Z'),
    { ok: false, error: 'invalid-input' },
  )
})

test('editar conserva identidad y cerrar es una transición terminal', () => {
  const created = createGameListing(saleInput, 'owner-a', 'listing-a', '2026-09-12T12:00:00.000Z')
  assert.equal(created.ok, true)
  if (!created.ok) return

  const updated = updateGameListing(created.value, { ...saleInput, gameName: 'Wingspan europeo' }, 'owner-a')
  assert.equal(updated.ok, true)
  if (!updated.ok) return
  assert.equal(updated.value.id, 'listing-a')
  assert.equal(updated.value.ownerId, 'owner-a')

  const closed = closeGameListing(updated.value, 'owner-a')
  assert.equal(closed.ok, true)
  if (!closed.ok) return
  assert.equal(closed.value.status, 'closed')
  assert.deepEqual(updateGameListing(closed.value, saleInput, 'owner-a'), { ok: false, error: 'listing-closed' })
  assert.deepEqual(closeGameListing(closed.value, 'owner-a'), { ok: false, error: 'listing-closed' })
})

test('un interés no permite auto-interés, duplicados ni anuncios cerrados', () => {
  const created = createGameListing(saleInput, 'owner-a', 'listing-a', '2026-09-12T12:00:00.000Z')
  assert.equal(created.ok, true)
  if (!created.ok) return

  assert.deepEqual(
    expressListingInterest(created.value, 'owner-a', null, '2026-09-12T12:01:00.000Z'),
    { ok: false, error: 'own-listing' },
  )

  const interest = expressListingInterest(created.value, 'player-b', null, '2026-09-12T12:01:00.000Z')
  assert.equal(interest.ok, true)
  if (!interest.ok) return
  assert.equal(interest.value.status, 'pending')
  assert.deepEqual(
    expressListingInterest(created.value, 'player-b', interest.value, '2026-09-12T12:02:00.000Z'),
    { ok: false, error: 'interest-already-expressed' },
  )

  const closed = closeGameListing(created.value, 'owner-a')
  assert.equal(closed.ok, true)
  if (!closed.ok) return
  assert.deepEqual(
    expressListingInterest(closed.value, 'player-c', null, '2026-09-12T12:03:00.000Z'),
    { ok: false, error: 'listing-closed' },
  )
})
