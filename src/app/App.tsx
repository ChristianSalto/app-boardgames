import { Navigate, Route, Routes } from 'react-router-dom'
import { CreateSessionPage } from '../game-sessions/CreateSessionPage'
import { ExplorePage } from '../game-sessions/ExplorePage'
import { MySessionsPage } from '../game-sessions/MySessionsPage'
import { SessionDetailPage } from '../game-sessions/SessionDetailPage'
import { PlayerProfilePage } from '../players/PlayerProfilePage'
import { AppShell } from '../shared/AppShell'

export function App() {
  return (
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
  )
}
