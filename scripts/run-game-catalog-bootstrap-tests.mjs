import { spawn, spawnSync } from 'node:child_process'
import { connect } from 'node:net'
import { fileURLToPath } from 'node:url'

const project = 'demo-mesa-abierta-game-catalog-bootstrap-tests'
const root = fileURLToPath(new URL('..', import.meta.url))
const firebaseCli = fileURLToPath(new URL('../node_modules/firebase-tools/lib/bin/firebase.js', import.meta.url))
const occupied = (port) => new Promise((resolve) => {
  const socket = connect(port, '127.0.0.1')
  socket.once('connect', () => { socket.destroy(); resolve(true) })
  socket.once('error', () => resolve(false))
})
for (const port of [8180, 9150]) {
  if (await occupied(port)) throw new Error(`Port ${port} already in use; refusing to start or stop another emulator`)
}
const child = spawn(process.execPath, [
  firebaseCli, 'emulators:exec', '--project', project,
  '--config', 'firebase.rules-test.json', '--only', 'firestore',
  'node --experimental-strip-types --test tests/game-catalog-bootstrap.emulator.test.mjs',
], {
  cwd: root,
  env: { ...process.env, MESA_ABIERTA_BOOTSTRAP_TEST_PROJECT: project },
  stdio: 'inherit',
})
console.log(`Bootstrap test runner PID: ${process.pid}; Firebase CLI PID: ${child.pid}`)
const status = await new Promise((resolve, reject) => {
  child.once('exit', (code) => resolve(code ?? 1))
  child.once('error', reject)
})
for (const port of [8180, 9150]) {
  if (await occupied(port)) throw new Error(`Own emulator did not release port ${port}`)
}
process.exitCode = status
