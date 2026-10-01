import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const { GameCombobox } = await server.ssrLoadModule('/src/games/presentation/GameCombobox.tsx')

test.after(async () => { await server.close() })

test('combobox renders a real label, input relationship and idle announcement', () => {
  const html = renderToStaticMarkup(createElement(GameCombobox, {
    id: 'game-test', label: 'Juego', value: null, onChange: () => {}, search: async () => [],
  }))
  assert.match(html, /<label[^>]+for="game-test"[^>]*>Juego<\/label>/)
  assert.match(html, /<input[^>]+id="game-test"[^>]+role="combobox"/)
  assert.match(html, /aria-autocomplete="list"/)
  assert.match(html, /aria-expanded="false"/)
  assert.match(html, /aria-describedby="game-test-status"/)
  assert.match(html, /maxLength="120"/)
  assert.match(html, /aria-live="polite"[^>]*>Escribe para buscar un juego\./)
})

test('selected GameSelection is represented by one field and can be cleared', () => {
  const html = renderToStaticMarkup(createElement(GameCombobox, {
    id: 'game-test', label: 'Juego',
    value: { kind: 'cataloged', id: 'azul', name: 'Azul' },
    onChange: () => {}, search: async () => [],
  }))
  assert.match(html, /value="Azul"/)
  assert.match(html, /aria-label="Limpiar juego"/)
  assert.equal((html.match(/<input/g) ?? []).length, 1)
})
