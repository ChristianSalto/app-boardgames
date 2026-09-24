import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const firebaseCli = fileURLToPath(new URL('../node_modules/firebase-tools/lib/bin/firebase.js', import.meta.url))
const prepareRules = fileURLToPath(new URL('./prepare-emulator-firestore-rules.mjs', import.meta.url))

const prepareResult = spawnSync(process.execPath, [prepareRules], {
  cwd: projectRoot,
  stdio: 'inherit',
})

if (prepareResult.error) throw prepareResult.error
if (prepareResult.status !== 0) process.exit(prepareResult.status ?? 1)

const result = spawnSync(process.execPath, [
  firebaseCli,
  'emulators:exec',
  '--project',
  'demo-mesa-abierta-local-access',
  '--config',
  'firebase.local-rules-test.json',
  '--only',
  'firestore',
  'node --test tests/firestore.local-access.test.mjs',
], {
  cwd: projectRoot,
  env: {
    ...process.env,
    MESA_ABIERTA_LOCAL_RULES_PROJECT_ID: 'demo-mesa-abierta-local-access',
    MESA_ABIERTA_LOCAL_RULES_PORT: '8280',
  },
  stdio: 'inherit',
})

if (result.error) throw result.error
process.exitCode = result.status ?? 1
