import assert from 'node:assert/strict'
import test from 'node:test'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc } from 'firebase/firestore'
import { listGames } from '../src/games/application/gameCatalogRepository.ts'
import { createFirestoreGameCatalogRepository } from '../src/games/infrastructure/firestoreGameCatalogRepository.ts'
import { searchCatalogGames } from './fixtures/catalogGames.ts'

const projectId = process.env.MESA_ABIERTA_GAME_SESSION_PROJECT_ID
  ?? 'demo-mesa-abierta-game-session-tests'
const port = Number(process.env.MESA_ABIERTA_GAME_SESSION_PORT ?? '8180')

test('Firestore catalog adapter reads deterministic local entries through the Application port', async () => {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port },
  })
  try {
    await environment.clearFirestore()
    await environment.withSecurityRulesDisabled(async (context) => {
      const database = context.firestore()
      await Promise.all([
        setDoc(doc(database, 'betaTesters', 'belial'), { active: true }),
        ...searchCatalogGames.map((game) => setDoc(doc(database, 'games', game.id), {
          name: game.name,
          ...(game.aliases ? { aliases: game.aliases } : {}),
        })),
      ])
    })
    const repository = createFirestoreGameCatalogRepository(environment.authenticatedContext('belial').firestore())
    const games = await listGames(repository)
    assert.deepEqual(games, [...searchCatalogGames].sort((first, second) => first.name.localeCompare(second.name, 'es')))
  } finally {
    await environment.cleanup()
  }
})
