import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const projectId = process.env.MESA_ABIERTA_LOCAL_RULES_PROJECT_ID ?? 'demo-mesa-abierta-local-access'
const port = Number(process.env.MESA_ABIERTA_LOCAL_RULES_PORT ?? 8280)
const rules = readFileSync(new URL('../.firebase/firestore.emulator.rules', import.meta.url), 'utf8')
let environment

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port, rules },
  })
})

after(async () => environment.cleanup())

test('local authenticated users keep app access without a betaTester document', async () => {
  const authenticatedDb = environment.authenticatedContext('local-user').firestore()
  const playerReference = doc(authenticatedDb, 'players', 'local-user')

  await assertSucceeds(setDoc(playerReference, {
    displayName: 'Local User',
    city: 'Madrid',
  }))
  await assertSucceeds(getDoc(playerReference))
  await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'players', 'local-user')))
})
