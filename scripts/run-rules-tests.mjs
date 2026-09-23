import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectId = 'demo-mesa-abierta-rules-tests'
const firebaseCli = fileURLToPath(new URL('../node_modules/firebase-tools/lib/bin/firebase.js', import.meta.url))
const testCommand = 'node --test --test-concurrency=1 tests/firestore.rules.test.mjs tests/storage.rules.test.mjs'

const result = spawnSync(process.execPath, [
  firebaseCli,
  'emulators:exec',
  '--project',
  projectId,
  '--config',
  'firebase.rules-test.json',
  '--only',
  'firestore,storage',
  testCommand,
], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: {
    ...process.env,
    MESA_ABIERTA_RULES_PROJECT_ID: projectId,
    MESA_ABIERTA_FIRESTORE_RULES_PORT: '8180',
    MESA_ABIERTA_STORAGE_RULES_PORT: '9299',
  },
  stdio: 'inherit',
})

if (result.error) throw result.error
process.exitCode = result.status ?? 1
