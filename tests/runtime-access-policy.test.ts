import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { resolveRuntimeAccessPolicy } from '../src/app/composition/runtimeAccessPolicy.ts'

describe('runtime access policy', () => {
  test('enables the closed beta and disables registration only in cloud DEV', () => {
    assert.deepEqual(resolveRuntimeAccessPolicy({
      mode: 'cloud',
      firebaseProjectId: 'mesa-abierta-dev',
      useFirebaseEmulators: 'false',
    }), {
      closedBetaEnabled: true,
      registrationEnabled: false,
    })
  })

  test('keeps registration available with the local Emulator Suite', () => {
    assert.deepEqual(resolveRuntimeAccessPolicy({
      mode: 'development',
      firebaseProjectId: 'demo-mesa-abierta',
    }), {
      closedBetaEnabled: false,
      registrationEnabled: true,
    })

    assert.equal(resolveRuntimeAccessPolicy({
      mode: 'cloud',
      firebaseProjectId: 'mesa-abierta-dev',
      useFirebaseEmulators: 'true',
    }).closedBetaEnabled, false)
  })
})
