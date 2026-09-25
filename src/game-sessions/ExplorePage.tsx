import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { AppIcon } from '../shared/AppIcon'
import { VisualSelect } from '../shared/VisualSelect'
import {
  isSessionAvailable,
  matchesDateFilter,
  sortSessionsByDate,
} from './model'
import { SessionCard } from './SessionCard'
import { CommunityListingsSection } from '../game-listings/presentation/CommunityListingsSection'
import type { DateFilter } from './types'

const dateOptions = [
  { value: 'all', label: 'Cualquier fecha' },
  { value: 'today', label: 'Hoy' },
  { value: 'seven-days', label: 'Próximos 7 días' },
  { value: 'weekend', label: 'Este fin de semana' },
] satisfies ReadonlyArray<{ value: DateFilter; label: string }>

export function ExplorePage() {
  const { sessions } = usePrototype()
  const [searchParams, setSearchParams] = useSearchParams()
  const game = searchParams.get('game') ?? ''
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
    () => [...new Set(availableSessions.map((session) => session.zone))].sort(),
    [availableSessions],
  )

  const filteredSessions = useMemo(() => {
    const normalizedGame = game.trim().toLocaleLowerCase('es-ES')
    return availableSessions.filter(
      (session) =>
        session.game.toLocaleLowerCase('es-ES').includes(normalizedGame) &&
        matchesDateFilter(session.startsAt, date) &&
        (zone === 'all' || session.zone === zone),
    )
  }, [availableSessions, date, game, zone])

  const hasFilters = game !== '' || date !== 'all' || zone !== 'all'
  const clearFilters = () => setSearchParams(new URLSearchParams(), { replace: true })

  return (
    <>
      <section className="hero">
        <div className="page-container hero__inner">
          <div className="hero__content">
            <p className="eyebrow">Comunidad de juegos de mesa · Madrid</p>
            <h1>Encuentra gente con quien jugar.</h1>
            <p className="hero__lead">
              Explora partidas de juegos de mesa en Madrid y solicita tu plaza.
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

      <section className="page-container explore-section" aria-labelledby="explore-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explorar</p>
            <h2 id="explore-title">Partidas disponibles</h2>
          </div>
          <span className="location-context">
            <AppIcon name="location" /> Madrid
          </span>
        </div>

        <div className="filters" aria-label="Filtros de partidas">
          <div className="field filters__game">
            <label htmlFor="game-filter">Juego</label>
            <div className="search-control">
              <input
                id="game-filter"
                onChange={(event) => updateFilter('game', event.target.value, '')}
                placeholder="Ej. Wingspan"
                type="search"
                value={game}
              />
              {game ? (
                <button
                  aria-label="Limpiar filtro de juego"
                  className="search-control__clear"
                  onClick={() => updateFilter('game', '', '')}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              ) : null}
            </div>
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

        <p className="results-count" aria-live="polite">
          {filteredSessions.length}{' '}
          {filteredSessions.length === 1 ? 'partida disponible' : 'partidas disponibles'}
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
            <h3>{hasFilters ? 'No hay partidas que coincidan con tu búsqueda' : 'Todavía no hay partidas disponibles'}</h3>
            <p>
              {hasFilters
                ? 'Prueba a cambiar los filtros para ampliar la búsqueda.'
                : 'Cuando haya nuevas partidas disponibles, las encontrarás aquí.'}
            </p>
          </div>
        )}
      </section>
      <div className="page-container"><CommunityListingsSection /></div>
    </>
  )
}
