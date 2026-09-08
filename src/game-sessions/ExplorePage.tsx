import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { gameOptions } from '../mock-data/prototypeData'
import { AppIcon } from '../shared/AppIcon'
import {
  isSessionAvailable,
  matchesDateFilter,
  sortSessionsByDate,
} from './model'
import { SessionCard } from './SessionCard'
import type { DateFilter } from './types'

export function ExplorePage() {
  const { sessions } = usePrototype()
  const [game, setGame] = useState('')
  const [date, setDate] = useState<DateFilter>('all')
  const [zone, setZone] = useState('all')

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
  const clearFilters = () => {
    setGame('')
    setDate('all')
    setZone('all')
  }

  return (
    <>
      <section className="hero">
        <div className="page-container hero__inner">
          <div className="hero__content">
            <p className="eyebrow">Madrid · partidas cercanas</p>
            <h1>Tu próxima mesa empieza aquí.</h1>
            <p className="hero__lead">
              Encuentra gente, elige una partida y solicita tu plaza. Sin grupos
              eternos ni planes que se pierden en el chat.
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
            <input
              id="game-filter"
              list="game-options"
              onChange={(event) => setGame(event.target.value)}
              placeholder="Buscar un juego"
              type="search"
              value={game}
            />
            <datalist id="game-options">
              {gameOptions.map((option) => <option key={option} value={option} />)}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="date-filter">Fecha</label>
            <select
              id="date-filter"
              onChange={(event) => setDate(event.target.value as DateFilter)}
              value={date}
            >
              <option value="all">Cualquier fecha</option>
              <option value="today">Hoy</option>
              <option value="seven-days">Próximos 7 días</option>
              <option value="weekend">Este fin de semana</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="zone-filter">Zona o distrito</label>
            <select id="zone-filter" onChange={(event) => setZone(event.target.value)} value={zone}>
              <option value="all">Todas las zonas</option>
              {zones.map((item) => <option key={item}>{item}</option>)}
            </select>
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
          <div className="empty-state">
            <span className="empty-state__symbol" aria-hidden="true">◇</span>
            <h3>{hasFilters ? 'No hay resultados' : 'Todavía no hay partidas disponibles'}</h3>
            <p>
              {hasFilters
                ? 'Prueba a cambiar el juego, la fecha o la zona.'
                : 'Puedes ser la primera persona en organizar una mesa en Madrid.'}
            </p>
            {hasFilters ? (
              <button className="button button--secondary" onClick={clearFilters} type="button">
                Limpiar filtros
              </button>
            ) : (
              <Link className="button button--primary" to="/create">Crear una partida</Link>
            )}
          </div>
        )}
      </section>
    </>
  )
}
