import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { getUserRelation, sortSessionsByDate } from './model'
import { SessionCard } from './SessionCard'

type MySessionsTab = 'organized' | 'participating'

export function MySessionsPage() {
  const { currentPlayerId, sessions } = usePrototype()
  const [activeTab, setActiveTab] = useState<MySessionsTab>('organized')

  const organized = useMemo(
    () => sortSessionsByDate(sessions.filter((session) => session.organizerId === currentPlayerId)),
    [currentPlayerId, sessions],
  )

  const participating = useMemo(
    () =>
      sortSessionsByDate(
        sessions.filter((session) => {
          const relation = getUserRelation(session, currentPlayerId)
          return relation !== 'none' && relation !== 'organizer'
        }),
      ),
    [currentPlayerId, sessions],
  )

  const displayedSessions = activeTab === 'organized' ? organized : participating

  return (
    <section className="page-container page-section">
      <div className="page-heading">
        <p className="eyebrow">Tu agenda de juego</p>
        <h1>Mis partidas</h1>
        <p>Organiza tus mesas y sigue el estado de las plazas que has solicitado.</p>
      </div>

      <div className="segmented-control" role="tablist" aria-label="Tipo de partidas">
        <button
          aria-controls="my-sessions-panel"
          aria-selected={activeTab === 'organized'}
          className={activeTab === 'organized' ? 'is-active' : ''}
          id="organized-tab"
          onClick={() => setActiveTab('organized')}
          role="tab"
          type="button"
        >
          Organizadas por mí <span>{organized.length}</span>
        </button>
        <button
          aria-controls="my-sessions-panel"
          aria-selected={activeTab === 'participating'}
          className={activeTab === 'participating' ? 'is-active' : ''}
          id="participating-tab"
          onClick={() => setActiveTab('participating')}
          role="tab"
          type="button"
        >
          Participo / he solicitado <span>{participating.length}</span>
        </button>
      </div>

      <div
        aria-labelledby={activeTab === 'organized' ? 'organized-tab' : 'participating-tab'}
        id="my-sessions-panel"
        role="tabpanel"
        tabIndex={0}
      >
        {displayedSessions.length > 0 ? (
          <div className="session-grid">
            {displayedSessions.map((session) => (
              <SessionCard key={session.id} session={session} showRelation />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__symbol" aria-hidden="true">◇</span>
            <h2>
              {activeTab === 'organized'
                ? 'Aún no has organizado partidas'
                : 'Aún no has solicitado participar'}
            </h2>
            <p>
              {activeTab === 'organized'
                ? 'Publica una mesa y encuentra personas con las que jugar.'
                : 'Explora las partidas disponibles en Madrid.'}
            </p>
            <Link
              className="button button--primary"
              to={activeTab === 'organized' ? '/create' : '/'}
            >
              {activeTab === 'organized' ? 'Crear partida' : 'Explorar partidas'}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
