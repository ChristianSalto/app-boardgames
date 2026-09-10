import { Navigate, Route, Routes } from 'react-router-dom'
import { PrototypeProvider } from './PrototypeContext'
import { useAuthentication } from '../authentication/presentation/AuthenticationProvider'
import { LoginPage, RegisterPage } from '../authentication/presentation/AuthenticationPages'
import { CreateSessionPage } from '../game-sessions/CreateSessionPage'
import { ExplorePage } from '../game-sessions/ExplorePage'
import { MySessionsPage } from '../game-sessions/MySessionsPage'
import { SessionDetailPage } from '../game-sessions/SessionDetailPage'
import { PlayerProfilePage } from '../players/PlayerProfilePage'
import type { Player } from '../players/types'
import type { GameSessionRepository } from '../game-sessions/application/gameSessionRepository'
import type { ParticipationRequestRepository } from '../game-sessions/application/participationRequestRepository'
import type { PlayerRepository } from '../players/application/playerRepository'
import { CompleteProfilePage } from '../players/presentation/CompleteProfilePage'
import { useCurrentPlayer } from '../players/presentation/CurrentPlayerProvider'
import { AppShell } from '../shared/AppShell'

export function App({
  gameSessionRepository,
  participationRequestRepository,
  playerRepository,
}: {
  readonly gameSessionRepository: GameSessionRepository
  readonly participationRequestRepository: ParticipationRequestRepository
  readonly playerRepository: PlayerRepository
}) {
  const { status, user } = useAuthentication()
  const { player, status: playerStatus } = useCurrentPlayer()

  if (status === 'resolving' || (status === 'authenticated' && playerStatus === 'loading')) {
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
      <Route path="/complete-profile" element={user && playerStatus === 'missing' ? <CompleteProfilePage /> : <Navigate replace to="/" />} />
      <Route
        path="*"
        element={
          user && player ? <AuthenticatedPrototype
            player={player}
            repository={gameSessionRepository}
            participationRequestRepository={participationRequestRepository}
            playerRepository={playerRepository}
          /> : user && playerStatus === 'missing' ? <Navigate replace to="/complete-profile" /> : <Navigate replace to="/login" />
        }
      />
    </Routes>
  )
}

function AuthenticatedPrototype({
  player,
  repository,
  participationRequestRepository,
  playerRepository,
}: {
  readonly player: Player
  readonly repository: GameSessionRepository
  readonly participationRequestRepository: ParticipationRequestRepository
  readonly playerRepository: PlayerRepository
}) {
  return (
    <PrototypeProvider
      currentPlayer={player}
      sessionRepository={repository}
      participationRequestRepository={participationRequestRepository}
      playerRepository={playerRepository}
      key={player.id}
    >
      <AppShell>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
          <Route path="/sessions/:sessionId/edit" element={<CreateSessionPage />} />
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
