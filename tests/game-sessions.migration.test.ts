import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore'

const projectId = process.env.MESA_ABIERTA_GAME_SESSION_PROJECT_ID
  ?? 'demo-mesa-abierta-game-session-tests'
const port = Number(process.env.MESA_ABIERTA_GAME_SESSION_PORT ?? '8180')

test('legacy date/time migration is Madrid-aware, non-destructive and idempotent', async () => {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port },
  })

  try {
    await environment.clearFirestore()
    await environment.withSecurityRulesDisabled(async (context) => {
      const database = context.firestore()
      await Promise.all([
        setDoc(doc(database, 'gameSessions', 'legacy-session'), {
          gameName: 'Azul',
          date: '2026-07-20',
          time: '16:00',
          city: 'Madrid',
          district: 'Retiro',
          capacity: 4,
          organizerId: 'olivia',
          participantIds: ['olivia', 'pablo'],
          pendingRequestIds: ['legacy-request'],
          status: 'scheduled',
          untouched: 'preserved',
        }),
        setDoc(doc(database, 'gameSessions', 'canonical-session'), {
          startsAt: Timestamp.fromDate(new Date('2026-01-20T15:00:00.000Z')),
          date: '2026-01-20',
          time: '16:00',
        }),
      ])
    })

    const first = runMigration()
    assert.equal(first.status, 0, first.stderr)
    assert.match(first.stdout, /1 migradas, 1 omitidas, 0 con error/)

    await environment.withSecurityRulesDisabled(async (context) => {
      const migrated = await getDoc(doc(context.firestore(), 'gameSessions', 'legacy-session'))
      assert.equal(migrated.data()?.startsAt instanceof Timestamp, true)
      assert.equal(migrated.data()?.startsAt.toDate().toISOString(), '2026-07-20T14:00:00.000Z')
      assert.deepEqual(migrated.data()?.participantIds, ['olivia', 'pablo'])
      assert.deepEqual(migrated.data()?.pendingRequestIds, ['legacy-request'])
      assert.equal(migrated.data()?.organizerId, 'olivia')
      assert.equal(migrated.data()?.untouched, 'preserved')
    })

    const second = runMigration()
    assert.equal(second.status, 0, second.stderr)
    assert.match(second.stdout, /0 migradas, 2 omitidas, 0 con error/)
  } finally {
    await environment.cleanup()
  }
})

const runMigration = () => spawnSync(process.execPath, [
  '--experimental-strip-types',
  'scripts/migrate-session-starts-at.mjs',
], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    GCLOUD_PROJECT: projectId,
    FIRESTORE_EMULATOR_HOST: `127.0.0.1:${port}`,
  },
  encoding: 'utf8',
})
