import type { SessionObservationError } from '../application/sessionObservation.ts'

export const toSessionObservationError = (error: unknown): SessionObservationError => {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
  if (code === 'permission-denied') return 'permission-denied'
  if (code === 'unavailable') return 'unavailable'
  return 'unexpected'
}
