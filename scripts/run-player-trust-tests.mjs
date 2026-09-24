import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const projectId = 'demo-mesa-abierta-player-trust-tests'
const firebaseCli = fileURLToPath(new URL('../node_modules/firebase-tools/lib/bin/firebase.js', import.meta.url))

const run = (command, args, environment = process.env) => spawnSync(command, args, {
  cwd: root,
  env: environment,
  stdio: 'inherit',
})

const unit = run(process.execPath, [
  '--experimental-strip-types',
  '--test',
  'tests/player-trust.domain.test.ts',
  'tests/player-trust.application.test.ts',
])
if (unit.error) throw unit.error
if (unit.status !== 0) process.exit(unit.status ?? 1)

const integrationCommand = 'node --experimental-strip-types --test tests/player-trust.firestore.integration.test.ts'
const integration = run(process.execPath, [
  firebaseCli,
  'emulators:exec',
  '--project',
  projectId,
  '--config',
  'firebase.rules-test.json',
  '--only',
  'firestore',
  integrationCommand,
], {
  ...process.env,
  MESA_ABIERTA_PLAYER_TRUST_PROJECT_ID: projectId,
  MESA_ABIERTA_PLAYER_TRUST_PORT: '8180',
})
if (integration.error) throw integration.error
process.exitCode = integration.status ?? 1
