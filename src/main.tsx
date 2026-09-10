import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { initializeFirebaseInfrastructure } from './app/composition/firebase'
import { PrototypeProvider } from './app/PrototypeContext'
import './styles/main.scss'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

initializeFirebaseInfrastructure()

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <PrototypeProvider>
        <App />
      </PrototypeProvider>
    </BrowserRouter>
  </StrictMode>,
)
