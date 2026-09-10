import { Navigate, Route, Routes } from 'react-router-dom'
import { getPrototypePlayerId } from './composition/prototypeAuthenticatedPlayer'
import { PrototypeProvider } from './PrototypeContext'
import type { AuthenticatedUser } from '../authentication/application/authentication'
import { useAuthentication } from '../authentication/presentation/AuthenticationProvider'
import { LoginPage, RegisterPage } from '../authentication/presentation/AuthenticationPages'
import { CreateSessionPage } from '../game-sessions/CreateSessionPage'
import { ExplorePage } from '../game-sessions/ExplorePage'
import { MySessionsPage } from '../game-sessions/MySessionsPage'
import { SessionDetailPage } from '../game-sessions/SessionDetailPage'
import { PlayerProfilePage } from '../players/PlayerProfilePage'
import { AppShell } from '../shared/AppShell'

export function App() {
  const { status, user } = useAuthentication()

  if (status === 'resolving') {
    return (
      <main className="auth-state" aria-live="polite">
        <p>Comprobando tu sesión…</p>
      </main>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate replace to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate replace to="/" /> : <RegisterPage />} />
      <Route
        path="*"
        element={
          user ? <AuthenticatedPrototype user={user} /> : <Navigate replace to="/login" />
        }
      />
    </Routes>
  )
}

function AuthenticatedPrototype({ user }: { readonly user: AuthenticatedUser }) {
  const currentPlayerId = getPrototypePlayerId(user)

  return (
    <PrototypeProvider currentPlayerId={currentPlayerId} key={user.id}>
      <AppShell>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
          <Route path="/my-sessions" element={<MySessionsPage />} />
          <Route path="/create" element={<CreateSessionPage />} />
          <Route path="/profile" element={<PlayerProfilePage />} />
          <Route path="/players/:playerId" element={<PlayerProfilePage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AppShell>
    </PrototypeProvider>
  )
}
