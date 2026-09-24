import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { initializeFirebaseInfrastructure } from './app/composition/firebase'
import { createFirebaseAuthenticationGateway } from './authentication/infrastructure/firebaseAuthentication'
import { createFirestoreBetaAccessRepository } from './authentication/infrastructure/firestoreBetaAccessRepository'
import { AuthenticationProvider } from './authentication/presentation/AuthenticationProvider'
import { ClosedBetaGuard } from './authentication/presentation/ClosedBetaGuard'
import { createFirestorePlayerRepository } from './players/infrastructure/firestorePlayerRepository'
import { createFirestoreGameSessionRepository } from './game-sessions/infrastructure/firestoreGameSessionRepository'
import { createFirestoreParticipationRequestRepository } from './game-sessions/infrastructure/firestoreParticipationRequestRepository'
import { CurrentPlayerProvider } from './players/presentation/CurrentPlayerProvider'
import { createFirestoreGameListingRepository } from './game-listings/infrastructure/firestoreGameListingRepository'
import { createFirestoreListingInterestRepository } from './game-listings/infrastructure/firestoreListingInterestRepository'
import { createFirebaseListingImageRepository } from './game-listings/infrastructure/firebaseListingImageRepository'
import { createFirestorePlayerReviewRepository } from './player-trust/infrastructure/firestorePlayerReviewRepository'
import { resolveRuntimeAccessPolicy } from './app/composition/runtimeAccessPolicy'
import './styles/main.scss'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

const firebaseInfrastructure = initializeFirebaseInfrastructure()
const authenticationGateway = createFirebaseAuthenticationGateway(firebaseInfrastructure.auth)
const betaAccessRepository = createFirestoreBetaAccessRepository(firebaseInfrastructure.firestore)
const playerRepository = createFirestorePlayerRepository(firebaseInfrastructure.firestore)
const gameSessionRepository = createFirestoreGameSessionRepository(firebaseInfrastructure.firestore)
const participationRequestRepository = createFirestoreParticipationRequestRepository(firebaseInfrastructure.firestore)
const gameListingRepository = createFirestoreGameListingRepository(firebaseInfrastructure.firestore)
const listingInterestRepository = createFirestoreListingInterestRepository(firebaseInfrastructure.firestore)
const listingImageRepository = createFirebaseListingImageRepository(firebaseInfrastructure.storage)
const playerReviewRepository = createFirestorePlayerReviewRepository(firebaseInfrastructure.firestore)
const listingCommandDependencies = {
  createId: () => `listing-${crypto.randomUUID()}`,
  now: () => new Date().toISOString(),
}
const runtimeAccessPolicy = resolveRuntimeAccessPolicy({
  mode: import.meta.env.MODE,
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  useFirebaseEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS,
})

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthenticationProvider gateway={authenticationGateway}>
        <ClosedBetaGuard
          enabled={runtimeAccessPolicy.closedBetaEnabled}
          repository={betaAccessRepository}
        >
          <CurrentPlayerProvider repository={playerRepository}>
            <App
              gameSessionRepository={gameSessionRepository}
              participationRequestRepository={participationRequestRepository}
              playerRepository={playerRepository}
              gameListingRepository={gameListingRepository}
              listingInterestRepository={listingInterestRepository}
              listingImageRepository={listingImageRepository}
              listingCommandDependencies={listingCommandDependencies}
              playerReviewRepository={playerReviewRepository}
              registrationEnabled={runtimeAccessPolicy.registrationEnabled}
            />
          </CurrentPlayerProvider>
        </ClosedBetaGuard>
      </AuthenticationProvider>
    </BrowserRouter>
  </StrictMode>,
)
