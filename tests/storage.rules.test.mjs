import { readFileSync } from 'node:fs'
import { after, before, beforeEach, describe, test } from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  deleteObject,
  getBytes,
  ref,
  uploadBytes,
} from 'firebase/storage'

const projectId = process.env.MESA_ABIERTA_RULES_PROJECT_ID ?? 'demo-mesa-abierta'
const port = Number(process.env.MESA_ABIERTA_STORAGE_RULES_PORT ?? 9199)
const rules = readFileSync(new URL('../storage.rules', import.meta.url), 'utf8')
const bucketUrl = `gs://${projectId}.appspot.com`
let environment

const storageFor = (uid) => environment.authenticatedContext(uid).storage(bucketUrl)
const anonymousStorage = () => environment.unauthenticatedContext().storage(bucketUrl)
const coverReference = (storage, ownerId = 'a', listingId = 'listing-a') => (
  ref(storage, `game-listings/${ownerId}/${listingId}/cover`)
)
const bytes = (size = 8) => new Uint8Array(size).fill(1)

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    storage: { host: '127.0.0.1', port, rules },
  })
})

beforeEach(async () => environment.clearStorage())
after(async () => environment.cleanup())

describe('game listing covers', () => {
  test('allows the owner to upload supported images, replace a cover and delete it', async () => {
    const a = storageFor('a')
    await assertSucceeds(uploadBytes(coverReference(a, 'a', 'png'), bytes(), { contentType: 'image/png' }))
    await assertSucceeds(uploadBytes(coverReference(a, 'a', 'jpeg'), bytes(), { contentType: 'image/jpeg' }))
    await assertSucceeds(uploadBytes(coverReference(a, 'a', 'webp'), bytes(), { contentType: 'image/webp' }))

    const replaceableCover = coverReference(a, 'a', 'replaceable')
    await assertSucceeds(uploadBytes(replaceableCover, bytes(), { contentType: 'image/png' }))
    await assertSucceeds(uploadBytes(replaceableCover, bytes(16), { contentType: 'image/webp' }))
    await assertSucceeds(deleteObject(replaceableCover))
  })

  test('allows authenticated users to read listing covers', async () => {
    const reference = coverReference(storageFor('a'))
    await assertSucceeds(uploadBytes(reference, bytes(), { contentType: 'image/png' }))
    await assertSucceeds(getBytes(coverReference(storageFor('b'))))
  })

  test('denies anonymous uploads and reads', async () => {
    const anonymousReference = coverReference(anonymousStorage(), 'anonymous')
    await assertFails(uploadBytes(anonymousReference, bytes(), { contentType: 'image/png' }))

    await assertSucceeds(uploadBytes(coverReference(storageFor('a')), bytes(), { contentType: 'image/png' }))
    await assertFails(getBytes(coverReference(anonymousStorage())))
  })

  test('denies writes, replacements and deletes in another owner folder', async () => {
    const ownerReference = coverReference(storageFor('a'))
    await assertSucceeds(uploadBytes(ownerReference, bytes(), { contentType: 'image/png' }))
    await assertFails(uploadBytes(coverReference(storageFor('b'), 'a', 'listing-b'), bytes(), { contentType: 'image/png' }))
    await assertFails(uploadBytes(coverReference(storageFor('b')), bytes(16), { contentType: 'image/webp' }))
    await assertFails(deleteObject(coverReference(storageFor('b'))))
  })

  test('denies oversized files, unsupported MIME types and unknown paths', async () => {
    const a = storageFor('a')
    await assertFails(uploadBytes(coverReference(a, 'a', 'oversized'), bytes(5 * 1024 * 1024 + 1), { contentType: 'image/png' }))
    await assertFails(uploadBytes(coverReference(a, 'a', 'text'), bytes(), { contentType: 'text/plain' }))
    await assertFails(uploadBytes(ref(a, 'game-listings/a/listing-a/gallery/one'), bytes(), { contentType: 'image/png' }))
    await assertFails(uploadBytes(ref(a, 'avatars/a/profile'), bytes(), { contentType: 'image/png' }))
  })
})
