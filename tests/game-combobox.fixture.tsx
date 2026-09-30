import { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/main.scss'
import { searchGames } from '../src/games/application/searchGames.ts'
import type { GameSelection } from '../src/games/application/gameSelection.ts'
import { GameCombobox } from '../src/games/presentation/GameCombobox.tsx'
import { searchCatalogGames } from './fixtures/catalogGames.ts'

function Fixture() {
  const [selection, setSelection] = useState<GameSelection | null>(null)
  const [allowUncataloged, setAllowUncataloged] = useState(true)
  const [fail, setFail] = useState(false)
  const [required, setRequired] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const search = useCallback(async (query: string) => {
    if (fail) throw new Error('Simulated local search failure')
    return searchGames({ list: async () => searchCatalogGames }, query)
  }, [fail])

  return (
    <main style={{ maxWidth: '38rem', margin: '2rem auto', padding: '1rem' }}>
      <h1>GameCombobox · fixture local</h1>
      <p>Catálogo local determinista. Sin conexión a Firebase.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <label><input type="checkbox" checked={allowUncataloged} onChange={(event) => setAllowUncataloged(event.target.checked)} /> Permitir juego sin ficha</label>
        <label><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} /> Simular error</label>
        <label><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> Selección obligatoria</label>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
        <GameCombobox
          id="fixture-game"
          label="Juego"
          value={selection}
          onChange={(next) => { setSelection(next); setSubmitted(false) }}
          search={search}
          allowUncataloged={allowUncataloged}
          required={required}
        />
        <button type="submit">Probar envío</button>
      </form>
      <output id="fixture-submit">{submitted ? 'Enviado' : 'Sin enviar'}</output>
      <output id="fixture-selection" style={{ display: 'block', marginTop: '4rem' }}>
        {selection ? JSON.stringify(selection) : 'Sin selección'}
      </output>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Fixture />)
