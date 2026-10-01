import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { VisualSelect } from '../shared/VisualSelect'
import { SessionLoadErrorState } from './SessionLoadErrorState'
import {
  isSessionAvailable,
  matchesDateFilter,
  sortSessionsByDate,
} from './model'
import { SessionCard } from './SessionCard'
import { CommunityListingsSection } from '../game-listings/presentation/CommunityListingsSection'
import type { DateFilter } from './types'
import type { GameCatalogRepository } from '../games/application/gameCatalogRepository'
import type { Game } from '../games/domain/game'
import { isValidGameId } from '../games/domain/game'
import type { GameSelection } from '../games/application/gameSelection'
import type { GameSearch } from '../games/application/searchGames'
import { GameCombobox } from '../games/presentation/GameCombobox'
import { clearExploreFilters, matchesExploreGame, readExploreGameFilter, writeExploreGameFilter } from './exploreGameFilter'

const dateOptions = [
  { value: 'all', label: 'Cualquier fecha' },
  { value: 'today', label: 'Hoy' },
  { value: 'seven-days', label: 'Próximos 7 días' },
  { value: 'weekend', label: 'Este fin de semana' },
] satisfies ReadonlyArray<{ value: DateFilter; label: string }>

export function ExplorePage({ searchGameCatalog, loadGameCatalog }: {
  readonly searchGameCatalog: GameSearch
  readonly loadGameCatalog: GameCatalogRepository['list']
}) {
  const { retrySessions, sessions, sessionsError, sessionsLoading } = usePrototype()
  const [searchParams, setSearchParams] = useSearchParams()
  const game = searchParams.get('game') ?? ''
  const gameId = searchParams.get('gameId') ?? ''
  const [resolved, setResolved] = useState<{ id: string; game: Game | null } | null>(null)
  useEffect(() => {
    if (!isValidGameId(gameId)) return
    let cancelled = false
    void loadGameCatalog().then(
      (games) => { if (!cancelled) setResolved({ id: gameId, game: games.find((item) => item.id === gameId) ?? null }) },
      () => { if (!cancelled) setResolved({ id: gameId, game: null }) },
    )
    return () => { cancelled = true }
  }, [gameId, loadGameCatalog])
  const selection = useMemo(
    () => readExploreGameFilter(new URLSearchParams({ game, gameId }), resolved?.id === gameId ? resolved.game : undefined),
    [game, gameId, resolved],
  )
  const updateGame = (next: GameSelection | null) => {
    if (next?.kind === 'cataloged') setResolved({ id: next.id, game: { id: next.id, name: next.name } })
    setSearchParams(writeExploreGameFilter(searchParams, next), { replace: true })
  }
  const dateValue = searchParams.get('date')
  const date = dateOptions.some((option) => option.value === dateValue)
    ? dateValue as DateFilter
    : 'all'
  const zone = searchParams.get('zone') ?? 'all'

  const updateFilter = (name: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === defaultValue) {
      next.delete(name)
    } else {
      next.set(name, value)
    }
    setSearchParams(next, { replace: true })
  }

  const availableSessions = useMemo(
    () => sortSessionsByDate(sessions.filter((session) => isSessionAvailable(session))),
    [sessions],
  )

  const zones = useMemo(
    () => [...new Set([
      ...availableSessions.map((session) => session.zone),
      ...(zone === 'all' ? [] : [zone]),
    ])].sort(),
    [availableSessions, zone],
  )

  const filteredSessions = useMemo(() => {
    return availableSessions.filter(
      (session) =>
        matchesExploreGame(session, selection) &&
        matchesDateFilter(session.startsAt, date) &&
        (zone === 'all' || session.zone === zone),
    )
  }, [availableSessions, date, selection, zone])

  const hasFilters = (game !== '' || gameId !== '') || date !== 'all' || zone !== 'all'
  const clearFilters = () => setSearchParams(clearExploreFilters(searchParams), { replace: true })

  return (
    <>
      <section className="hero">
        <div className="page-container hero__inner">
          <div className="hero__content">
            <h1>Encuentra partidas de juegos de mesa.</h1>
            <p className="hero__lead">
              En Madrid, solicita plaza en la partida que te encaje.
            </p>
          </div>
          <div className="hero__table" aria-hidden="true">
            <span className="hero__piece hero__piece--one" />
            <span className="hero__piece hero__piece--two" />
            <span className="hero__piece hero__piece--three" />
            <span className="hero__cards">MAD</span>
          </div>
        </div>
      </section>

      <section className="page-container explore-section" aria-label="Búsqueda de partidas">
        <div className="filters" aria-label="Filtros de partidas">
          <div className="field filters__game">
            <GameCombobox
              id="game-filter"
              label="Juego"
              value={selection}
              onChange={updateGame}
              search={searchGameCatalog}
              allowUncataloged
              allowTextSearch
            />
          </div>
          <fieldset className="filter-field filters__date">
            <legend>Fecha</legend>
            <div className="date-chips">
              {dateOptions.map((option) => {
                const isSelected = date === option.value

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`date-chip${isSelected ? ' is-selected' : ''}`}
                    key={option.value}
                    onClick={() => updateFilter('date', option.value, 'all')}
                    type="button"
                  >
                    {isSelected ? <span aria-hidden="true">✓</span> : null}
                    {option.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div className="field filters__zone">
            <label htmlFor="zone-filter" id="zone-filter-label">Zona o distrito</label>
            <VisualSelect
              ariaLabelledBy="zone-filter-label"
              id="zone-filter"
              onChange={(value) => updateFilter('zone', value, 'all')}
              options={[
                { value: 'all', label: 'Todas las zonas' },
                ...zones.map((item) => ({ value: item, label: item })),
              ]}
              value={zone}
            />
          </div>
          <button
            className="button button--ghost filters__clear"
            disabled={!hasFilters}
            onClick={clearFilters}
            type="button"
          >
            Limpiar
          </button>
        </div>

        {sessionsLoading ? <p aria-live="polite">Cargando partidas…</p> : null}
        {sessionsError ? (
          <SessionLoadErrorState
            loading={sessionsLoading}
            title="No hemos podido cargar las partidas"
            message="Comprueba tu conexión e inténtalo de nuevo."
            onRetry={() => { void retrySessions() }}
          />
        ) : null}
        {!sessionsLoading && !sessionsError ? (
          <>
            <p className="results-count" aria-live="polite">
              {filteredSessions.length}{' '}
              {filteredSessions.length === 1 ? 'resultado' : 'resultados'}
            </p>

            {filteredSessions.length > 0 ? (
              <div className="session-grid">
                {filteredSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="empty-state empty-state--compact">
                <div className="empty-state__symbol-container" aria-hidden="true">
                  <span className="empty-state__symbol">◇</span>
                </div>
                <h2>{hasFilters ? 'No hay partidas que coincidan con tu búsqueda' : 'Todavía no hay partidas disponibles'}</h2>
                <p>
                  {hasFilters
                    ? 'Prueba a cambiar los filtros para ampliar la búsqueda.'
                    : 'Cuando haya nuevas partidas disponibles, las encontrarás aquí.'}
                </p>
              </div>
            )}
          </>
        ) : null}
      </section>
      <div className="page-container"><CommunityListingsSection /></div>
    </>
  )
}
