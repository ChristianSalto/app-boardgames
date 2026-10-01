import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { generateKeyPairSync } from 'node:crypto'
import { test } from 'node:test'
import { initializeApp, deleteApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { initialCatalogGames } from '../src/games/initialCatalogGames.ts'

const project = 'demo-mesa-abierta-game-catalog-bootstrap-tests'
const host = '127.0.0.1:8180'
if (process.env.FIRESTORE_EMULATOR_HOST !== host || process.env.MESA_ABIERTA_BOOTSTRAP_TEST_PROJECT !== project) {
  throw new Error('Bootstrap tests require the dedicated local Firestore Emulator')
}
const app = initializeApp({ projectId: project, credential: cert({ projectId: project, clientEmail: 'emulator@local.invalid', privateKey: generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' }) }) })
const db = getFirestore(app)
const command = 'scripts/bootstrap-game-catalog-dev.mjs'
const run = (args, environment = {}) => spawnSync(process.execPath, ['--experimental-strip-types', command, ...args], {
  encoding: 'utf8',
  env: { ...process.env, ...environment },
})
const base = ['--emulator', '--project', project]
const clear = async () => {
  const response = await fetch(`http://${host}/emulator/v1/projects/${project}/databases/(default)/documents`, { method: 'DELETE' })
  assert.equal(response.status, 200)
}
const count = async () => (await db.collection('games').get()).size

try {
  await test('catalog bootstrap against Firestore Emulator', async (t) => {
    await clear()
    await t.test('A: empty catalog dry-run is eight CREATE without writing; apply creates all', async () => {
      const preview = run([...base, '--dry-run'])
      assert.equal(preview.status, 0, preview.stderr)
      assert.match(preview.stdout, /Project: demo-mesa-abierta-game-catalog-bootstrap-tests/)
      assert.match(preview.stdout, /Mode: DRY-RUN \(EMULATOR\)/)
      assert.match(preview.stdout, /CREATE: 8 /)
      assert.match(preview.stdout, /UNCHANGED: 0/)
      assert.match(preview.stdout, /CONFLICT: 0/)
      assert.match(preview.stdout, /Total: 8/)
      assert.equal(await count(), 0)
      console.log('REAL LOCAL DRY-RUN OUTPUT:\n' + preview.stdout.trim())
      const apply = run([...base, '--apply', '--confirm-project', project])
      assert.equal(apply.status, 0, apply.stderr)
      assert.equal(await count(), 8)
      for (const game of initialCatalogGames) {
        assert.deepEqual((await db.collection('games').doc(game.id).get()).data(), { name: game.name })
      }
    })
    await t.test('B: second execution is eight UNCHANGED', async () => {
      const preview = run([...base, '--dry-run'])
      assert.equal(preview.status, 0, preview.stderr)
      assert.match(preview.stdout, /CREATE: 0/)
      assert.match(preview.stdout, /UNCHANGED: 8 /)
      const apply = run([...base, '--apply', '--confirm-project', project])
      assert.equal(apply.status, 0, apply.stderr)
      assert.match(apply.stdout, /Applied: 0 created; 8 unchanged/)
      assert.equal(await count(), 8)
    })
    await t.test('C: incompatible document blocks entire apply', async () => {
      await clear()
      await db.collection('games').doc('azul').create({ name: 'Wrong' })
      const apply = run([...base, '--apply', '--confirm-project', project])
      assert.notEqual(apply.status, 0)
      assert.match(apply.stdout, /CREATE: 7 /)
      assert.match(apply.stdout, /CONFLICT: 1 \[azul\]/)
      assert.equal(await count(), 1)
      assert.deepEqual((await db.collection('games').doc('azul').get()).data(), { name: 'Wrong' })
    })
    await t.test('D: extra document remains intact and blocks apply', async () => {
      await clear()
      await db.collection('games').doc('unrelated').create({ name: 'Other', keep: true })
      const apply = run([...base, '--apply', '--confirm-project', project])
      assert.notEqual(apply.status, 0)
      assert.match(apply.stdout, /EXTRA: 1 \[unrelated\]/)
      assert.equal(await count(), 1)
      assert.deepEqual((await db.collection('games').doc('unrelated').get()).data(), { name: 'Other', keep: true })
    })
    await t.test('E/F: wrong project and confirmation reject before writes', async () => {
      await clear()
      const wrongProject = run(['--emulator', '--project', 'mesa-abierta-prod', '--dry-run'])
      assert.notEqual(wrongProject.status, 0)
      assert.match(wrongProject.stderr, /Explicit --project/)
      const missingProject = run(['--emulator', '--dry-run'])
      assert.notEqual(missingProject.status, 0)
      const wrongConfirm = run([...base, '--apply', '--confirm-project', 'mesa-abierta-prod'])
      assert.notEqual(wrongConfirm.status, 0)
      assert.match(wrongConfirm.stderr, /Apply requires --confirm-project/)
      assert.equal(await count(), 0)
    })
    await t.test('cloud mode rejects emulator env and absent credentials without connecting', () => {
      const rejectEmulator = run(['--project', 'mesa-abierta-dev', '--dry-run'], { GCLOUD_PROJECT: '', GOOGLE_CLOUD_PROJECT: '', FIREBASE_CONFIG: '' })
      assert.notEqual(rejectEmulator.status, 0)
      assert.match(rejectEmulator.stderr, /DEV mode rejects FIRESTORE_EMULATOR_HOST/)
      const rejectCredentials = run(['--project', 'mesa-abierta-dev', '--dry-run'], {
        FIRESTORE_EMULATOR_HOST: '', GOOGLE_APPLICATION_CREDENTIALS: '', GCLOUD_PROJECT: '', GOOGLE_CLOUD_PROJECT: '', FIREBASE_CONFIG: '',
      })
      assert.notEqual(rejectCredentials.status, 0)
      assert.match(rejectCredentials.stderr, /requires GOOGLE_APPLICATION_CREDENTIALS/)
    })
  })
} finally {
  await deleteApp(app)
}


