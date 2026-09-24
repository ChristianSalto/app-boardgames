import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const projectId = 'demo-mesa-abierta-game-session-tests'
const firebaseCli = fileURLToPath(new URL('../node_modules/firebase-tools/lib/bin/firebase.js', import.meta.url))

const run = (command, args, environment = process.env) => spawnSync(command, args, {
  cwd: root,
  env: environment,
  stdio: 'inherit',
})

const unit = run(process.execPath, [
  '--experimental-strip-types',
  '--test',
  'tests/game-sessions.time.test.ts',
])
if (unit.error) throw unit.error
if (unit.status !== 0) process.exit(unit.status ?? 1)

const migrationCommand = 'node --experimental-strip-types --test tests/game-sessions.migration.test.ts'
const migration = run(process.execPath, [
  firebaseCli,
  'emulators:exec',
  '--project',
  projectId,
  '--config',
  'firebase.rules-test.json',
  '--only',
  'firestore',
  migrationCommand,
], {
  ...process.env,
  MESA_ABIERTA_GAME_SESSION_PROJECT_ID: projectId,
  MESA_ABIERTA_GAME_SESSION_PORT: '8180',
})
if (migration.error) throw migration.error
process.exitCode = migration.status ?? 1
