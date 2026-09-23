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
import type { GameListingRepository } from '../game-listings/application/gameListingRepository'
import type { ListingInterestRepository } from '../game-listings/application/listingInterestRepository'
import type { ListingImageRepository } from '../game-listings/application/listingImageRepository'
import type { GameListingCommandDependencies } from '../game-listings/application/gameListings'
import { GameListingDetailPage } from '../game-listings/presentation/GameListingDetailPage'
import { GameListingsPage } from '../game-listings/presentation/GameListingsPage'
import { GameListingsProvider } from '../game-listings/presentation/GameListingsProvider'
import { ListingFormPage } from '../game-listings/presentation/ListingFormPage'
import { MyListingsPage } from '../game-listings/presentation/MyListingsPage'
import { CompleteProfilePage } from '../players/presentation/CompleteProfilePage'
import { useCurrentPlayer } from '../players/presentation/CurrentPlayerProvider'
import { AuthPageLayout } from '../shared/AuthPageLayout'
import { AppShell } from '../shared/AppShell'

export function App({
  gameSessionRepository,
  participationRequestRepository,
  playerRepository,
  gameListingRepository,
  listingInterestRepository,
  listingImageRepository,
  listingCommandDependencies,
}: {
  readonly gameSessionRepository: GameSessionRepository
  readonly participationRequestRepository: ParticipationRequestRepository
  readonly playerRepository: PlayerRepository
  readonly gameListingRepository: GameListingRepository
  readonly listingInterestRepository: ListingInterestRepository
  readonly listingImageRepository: ListingImageRepository
  readonly listingCommandDependencies: GameListingCommandDependencies
}) {
  const { status, user, logout } = useAuthentication()
  const { player, status: playerStatus, retryCurrentPlayer } = useCurrentPlayer()

  if (
    status === 'resolving'
    || (status === 'authenticated' && (playerStatus === 'idle' || playerStatus === 'loading'))
  ) {
    return (
      <main className="auth-state" aria-live="polite">
        <p>Comprobando tu sesión…</p>
      </main>
    )
  }

  if (status === 'authenticated' && playerStatus === 'error') {
    return (
      <AuthPageLayout
        brandHref={null}
        cardClassName="auth-card--failure"
        description="Comprueba tu conexión e inténtalo de nuevo."
        eyebrow="Estado de conexión"
        title="No hemos podido cargar tus datos"
      >
        <div className="form-card auth-form auth-form--branded auth-failure-actions">
          <button type="button" className="button button--primary button--wide auth-submit" onClick={() => void retryCurrentPlayer()}>
            Reintentar
          </button>
          <button type="button" className="button button--secondary button--wide" onClick={() => void logout()}>
            Cerrar sesión
          </button>
        </div>
      </AuthPageLayout>
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
            gameListingRepository={gameListingRepository}
            listingInterestRepository={listingInterestRepository}
            listingImageRepository={listingImageRepository}
            listingCommandDependencies={listingCommandDependencies}
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
  gameListingRepository,
  listingInterestRepository,
  listingImageRepository,
  listingCommandDependencies,
}: {
  readonly player: Player
  readonly repository: GameSessionRepository
  readonly participationRequestRepository: ParticipationRequestRepository
  readonly playerRepository: PlayerRepository
  readonly gameListingRepository: GameListingRepository
  readonly listingInterestRepository: ListingInterestRepository
  readonly listingImageRepository: ListingImageRepository
  readonly listingCommandDependencies: GameListingCommandDependencies
}) {
  return (
    <PrototypeProvider
      currentPlayer={player}
      sessionRepository={repository}
      participationRequestRepository={participationRequestRepository}
      playerRepository={playerRepository}
      key={player.id}
    >
      <GameListingsProvider
        commandDependencies={listingCommandDependencies}
        currentPlayerId={player.id}
        gameListingRepository={gameListingRepository}
        listingInterestRepository={listingInterestRepository}
        listingImageRepository={listingImageRepository}
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
            <Route path="/listings" element={<GameListingsPage />} />
            <Route path="/listings/my" element={<MyListingsPage />} />
            <Route path="/listings/create" element={<ListingFormPage />} />
            <Route path="/listings/:listingId/edit" element={<ListingFormPage />} />
            <Route path="/listings/:listingId" element={<GameListingDetailPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </AppShell>
      </GameListingsProvider>
    </PrototypeProvider>
  )
}
