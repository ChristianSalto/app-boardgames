import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Game } from '../domain/game.ts'
import type { GameSelection } from '../application/gameSelection.ts'

export type GameComboboxProps = Readonly<{
  id?: string
  label: string
  value: GameSelection | null
  onChange: (value: GameSelection | null) => void
  search: (query: string) => Promise<readonly Game[]>
  allowUncataloged?: boolean
  maxResults?: number
  disabled?: boolean
  required?: boolean
}>

type SearchState =
  | { query: string; status: 'loading' }
  | { query: string; status: 'results'; games: readonly Game[] }
  | { query: string; status: 'error' }

export function GameCombobox({
  id, label, value, onChange, search, allowUncataloged = false, maxResults = 8,
  disabled = false, required = false,
}: GameComboboxProps) {
  const generatedId = useId()
  const inputId = id ?? `${generatedId}-game`
  const listId = `${inputId}-list`
  const statusId = `${inputId}-status`
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousValue = useRef(value)
  const internalDeselect = useRef(false)
  const [query, setQuery] = useState(value?.name ?? '')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState<SearchState | null>(null)

  useEffect(() => {
    if (value) setQuery(value.name)
    else if (previousValue.current && !internalDeselect.current) setQuery('')
    previousValue.current = value
    internalDeselect.current = false
  }, [value])

  useLayoutEffect(() => {
    inputRef.current?.setCustomValidity(required && !value ? 'Selecciona un juego de la lista.' : '')
  }, [required, value])

  const trimmed = query.trim()
  useEffect(() => {
    if (value || !trimmed) return
    let cancelled = false
    const currentQuery = query
    setState({ query: currentQuery, status: 'loading' })
    Promise.resolve().then(() => search(currentQuery)).then(
      (games) => {
        if (!cancelled) setState({
          query: currentQuery,
          status: 'results',
          games: games.slice(0, Number.isFinite(maxResults) ? Math.max(1, Math.floor(maxResults)) : 8),
        })
      },
      () => { if (!cancelled) setState({ query: currentQuery, status: 'error' }) },
    )
    return () => { cancelled = true }
  }, [query, trimmed, value, search, retry, maxResults])

  const current = !value && trimmed && state?.query === query ? state : null
  const status = value ? 'selected' : !trimmed ? 'idle' : current?.status ?? 'loading'
  const games = current?.status === 'results' ? current.games : []
  const hasFallback = status === 'results' && games.length === 0 && allowUncataloged
  const optionsCount = games.length + (hasFallback ? 1 : 0)
  const showList = open && !disabled && optionsCount > 0
  const activeOptionId = showList && activeIndex >= 0 && activeIndex < optionsCount
    ? `${listId}-option-${activeIndex}` : undefined

  useEffect(() => {
    if (activeOptionId) document.getElementById(activeOptionId)?.scrollIntoView({ block: 'nearest' })
  }, [activeOptionId])

  const choose = (index: number, focusInput = true) => {
    if (index < games.length) {
      const game = games[index]
      if (!game) return
      onChange({ kind: 'cataloged', id: game.id, name: game.name })
      setQuery(game.name)
    } else if (hasFallback && index === games.length) {
      onChange({ kind: 'uncataloged', name: trimmed })
      setQuery(trimmed)
    } else return
    setOpen(false)
    setActiveIndex(-1)
    if (focusInput) inputRef.current?.focus()
    else inputRef.current?.blur()
  }

  const clear = () => {
    setQuery('')
    setState(null)
    setOpen(false)
    setActiveIndex(-1)
    onChange(null)
    inputRef.current?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
    } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && optionsCount > 0) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((currentIndex) => event.key === 'ArrowDown'
        ? (currentIndex + 1) % optionsCount
        : (currentIndex <= 0 ? optionsCount - 1 : currentIndex - 1))
    } else if (event.key === 'Enter' && showList && activeIndex >= 0) {
      event.preventDefault()
      choose(activeIndex)
    }
  }

  const statusText = status === 'idle' ? 'Escribe para buscar un juego.'
    : status === 'loading' ? 'Buscando juegos…'
      : status === 'error' ? 'No se pudo buscar. Vuelve a intentarlo.'
        : status === 'selected' ? 'Juego seleccionado.'
          : games.length === 0 ? 'No se encontraron juegos.'
            : `${games.length} ${games.length === 1 ? 'resultado' : 'resultados'}.`

  return (
    <div className="game-combobox" ref={rootRef} onBlur={(event) => {
      if (!rootRef.current?.contains(event.relatedTarget)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }}>
      <label className="game-combobox__label" htmlFor={inputId}>{label}</label>
      <div className="game-combobox__control">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-activedescendant={activeOptionId}
          aria-describedby={statusId}
          value={query}
          disabled={disabled}
          required={required}
          onFocus={() => { if (trimmed && !value) setOpen(true) }}
          onChange={(event) => {
            if (value) {
              internalDeselect.current = true
              onChange(null)
            }
            setQuery(event.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onKeyDown={onKeyDown}
        />
        {(query || value) && !disabled && (
          <button className="game-combobox__clear" type="button" aria-label="Limpiar juego" onClick={clear}>×</button>
        )}
        {showList && (
          <ul id={listId} className="game-combobox__list" role="listbox" aria-label="Juegos encontrados">
            {games.map((game, index) => (
              <li
                id={`${listId}-option-${index}`}
                key={game.id}
                role="option"
                aria-selected={activeIndex === index}
                className={activeIndex === index ? 'game-combobox__option is-active' : 'game-combobox__option'}
                onMouseDown={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                  if (event.pointerType !== 'mouse') { event.preventDefault(); choose(index, false) }
                }}
                onClick={() => choose(index)}
              >{game.name}</li>
            ))}
            {hasFallback && (
              <li
                id={`${listId}-option-${games.length}`}
                role="option"
                aria-selected={activeIndex === games.length}
                className={activeIndex === games.length ? 'game-combobox__option is-active' : 'game-combobox__option'}
                onMouseDown={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                  if (event.pointerType !== 'mouse') { event.preventDefault(); choose(games.length, false) }
                }}
                onClick={() => choose(games.length)}
              >Usar “{trimmed}” sin ficha de catálogo</li>
            )}
          </ul>
        )}
      </div>
      <div id={statusId} className="game-combobox__status" aria-live="polite">{statusText}</div>
      {status === 'error' && !disabled && (
        <button className="game-combobox__retry" type="button" onClick={() => { setRetry((count) => count + 1); setOpen(true) }}>
          Reintentar búsqueda
        </button>
      )}
    </div>
  )
}
