import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { initializeFirebaseInfrastructure } from './app/composition/firebase'
import { createFirebaseAuthenticationGateway } from './authentication/infrastructure/firebaseAuthentication'
import { AuthenticationProvider } from './authentication/presentation/AuthenticationProvider'
import { createFirestorePlayerRepository } from './players/infrastructure/firestorePlayerRepository'
import { createFirestoreGameSessionRepository } from './game-sessions/infrastructure/firestoreGameSessionRepository'
import { createFirestoreParticipationRequestRepository } from './game-sessions/infrastructure/firestoreParticipationRequestRepository'
import { CurrentPlayerProvider } from './players/presentation/CurrentPlayerProvider'
import { createInMemoryGameListingStore } from './game-listings/infrastructure/inMemoryGameListingStore'
import './styles/main.scss'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

const firebaseInfrastructure = initializeFirebaseInfrastructure()
const authenticationGateway = createFirebaseAuthenticationGateway(firebaseInfrastructure.auth)
const playerRepository = createFirestorePlayerRepository(firebaseInfrastructure.firestore)
const gameSessionRepository = createFirestoreGameSessionRepository(firebaseInfrastructure.firestore)
const participationRequestRepository = createFirestoreParticipationRequestRepository(firebaseInfrastructure.firestore)
const gameListingStore = createInMemoryGameListingStore()
const listingCommandDependencies = {
  createId: () => `listing-${crypto.randomUUID()}`,
  now: () => new Date().toISOString(),
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthenticationProvider gateway={authenticationGateway}>
        <CurrentPlayerProvider repository={playerRepository}>
          <App
            gameSessionRepository={gameSessionRepository}
            participationRequestRepository={participationRequestRepository}
            playerRepository={playerRepository}
            gameListingRepository={gameListingStore.gameListingRepository}
            listingInterestRepository={gameListingStore.listingInterestRepository}
            listingCommandDependencies={listingCommandDependencies}
          />
        </CurrentPlayerProvider>
      </AuthenticationProvider>
    </BrowserRouter>
  </StrictMode>,
)
