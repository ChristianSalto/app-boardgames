import assert from 'node:assert/strict'
import test from 'node:test'
import {
  instantToMadridCivil,
  madridCivilToInstant,
} from '../src/game-sessions/madridDateTime.ts'
import { formatSessionTime } from '../src/game-sessions/model.ts'

test('Madrid winter civil time resolves with UTC+1 and roundtrips unchanged', () => {
  const result = madridCivilToInstant('2026-01-20', '16:00')
  assert.deepEqual(result, {
    ok: true,
    instant: '2026-01-20T15:00:00.000Z',
    disambiguation: 'exact',
  })
  assert.deepEqual(instantToMadridCivil(result.ok ? result.instant : ''), {
    date: '2026-01-20',
    time: '16:00',
  })
})

test('Madrid summer civil time resolves with UTC+2 and remains 16:00 visibly', () => {
  const result = madridCivilToInstant('2026-07-20', '16:00')
  assert.equal(result.ok && result.instant, '2026-07-20T14:00:00.000Z')
  assert.equal(result.ok && formatSessionTime(result.instant), '16:00')
})

test('canonical instant may belong to the previous UTC day without changing Madrid date', () => {
  const result = madridCivilToInstant('2026-01-20', '00:30')
  assert.equal(result.ok && result.instant, '2026-01-19T23:30:00.000Z')
  assert.deepEqual(instantToMadridCivil(result.ok ? result.instant : ''), {
    date: '2026-01-20',
    time: '00:30',
  })
})

test('nonexistent spring time is rejected and ambiguous autumn time chooses the earlier instant', () => {
  assert.deepEqual(madridCivilToInstant('2026-03-29', '02:30'), {
    ok: false,
    reason: 'nonexistent-civil-time',
  })
  assert.deepEqual(madridCivilToInstant('2026-10-25', '02:30'), {
    ok: true,
    instant: '2026-10-25T00:30:00.000Z',
    disambiguation: 'earlier',
  })
})
