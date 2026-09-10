import type { AuthenticatedUser } from '../../authentication/application/authentication'
import { initialPlayers } from '../../mock-data/prototypeData'

const hashIdentifier = (value: string) => [...value].reduce(
  (hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0,
  0,
)

// This is a temporary composition-only bridge while Player profiles are still mock data.
export const getPrototypePlayerId = (user: AuthenticatedUser): string => {
  const index = hashIdentifier(user.id) % initialPlayers.length
  return initialPlayers[index]?.id ?? 'alex'
}
