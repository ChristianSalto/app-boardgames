import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { initializeFirebaseInfrastructure } from './app/composition/firebase'
import { createFirebaseAuthenticationGateway } from './authentication/infrastructure/firebaseAuthentication'
import { AuthenticationProvider } from './authentication/presentation/AuthenticationProvider'
import { createFirestorePlayerRepository } from './players/infrastructure/firestorePlayerRepository'
import { CurrentPlayerProvider } from './players/presentation/CurrentPlayerProvider'
import './styles/main.scss'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

const firebaseInfrastructure = initializeFirebaseInfrastructure()
const authenticationGateway = createFirebaseAuthenticationGateway(firebaseInfrastructure.auth)
const playerRepository = createFirestorePlayerRepository(firebaseInfrastructure.firestore)

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthenticationProvider gateway={authenticationGateway}>
        <CurrentPlayerProvider repository={playerRepository}>
          <App />
        </CurrentPlayerProvider>
      </AuthenticationProvider>
    </BrowserRouter>
  </StrictMode>,
)
