import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PrototypeProvider } from '../src/app/PrototypeContext.tsx'
import type { GameSessionRepository } from '../src/game-sessions/application/gameSessionRepository.ts'
import type { ParticipationRequestRepository } from '../src/game-sessions/application/participationRequestRepository.ts'
import type { SessionObserver } from '../src/game-sessions/application/sessionObservation.ts'
import { SessionDetailPage } from '../src/game-sessions/SessionDetailPage.tsx'
import type { GameSession, ParticipationRequest } from '../src/game-sessions/types.ts'
import type { PlayerRepository } from '../src/players/application/playerRepository.ts'
import type { PlayerReviewRepository } from '../src/player-trust/application/playerTrustRepository.ts'
import { PlayerTrustProvider } from '../src/player-trust/presentation/PlayerTrustProvider.tsx'

const people = [
  { id: 'rated', displayName: 'Redon', city: 'Madrid', district: 'Alcobendas', description: 'Me gustan los juegos de estrategia.' },
  { id: 'new', displayName: 'Ivy', city: 'Madrid', district: 'Salamanca', description: 'Soy una Saiyajin nivel 4.' },
  { id: 'no-bio', displayName: 'Lucía', city: 'Madrid', district: 'Centro' },
  { id: 'long-bio', displayName: 'Nombre compuesto excepcionalmente largo para probar el ajuste', city: 'Madrid', district: 'Chamberí', description: 'Una descripción extensa sin espacios: ' + 'reunión'.repeat(65) },
  ...Array.from({ length: 6 }, (_, index) => ({
    id: `extra-${index + 1}`, displayName: `Solicitante ${index + 1}`, city: 'Madrid', district: 'Retiro',
    description: `Quiero participar en esta partida ${index + 1}.`,
  })),
] as const

let root: Root | null = null
let container: HTMLElement | null = null
let emitRequests: ((requests: readonly ParticipationRequest[]) => void) | null = null

const requestsFor = (ids: readonly string[], sessionId: string): ParticipationRequest[] => ids.map((id) => ({
  id: `${sessionId}_${id}`, sessionId, playerId: id, status: 'pending',
}))

const until = (predicate: () => boolean, label: string) => new Promise<void>((resolve, reject) => {
  if (predicate()) { resolve(); return }
  const observer = new MutationObserver(() => {
    if (!predicate()) return
    clearTimeout(timeout)
    observer.disconnect()
    resolve()
  })
  observer.observe(document.body, { attributes: true, childList: true, characterData: true, subtree: true })
  const timeout = setTimeout(() => {
    observer.disconnect()
    reject(new Error(`Timed out waiting for ${label}`))
  }, 3000)
})

export const unmountOrganizerRequestsFixture = () => {
  root?.unmount()
  container?.remove()
  root = null
  container = null
  emitRequests = null
}

export const mountOrganizerRequestsFixture = async (count: number) => {
  unmountOrganizerRequestsFixture()
  const session: GameSession = {
    id: 'organizer-requests-fixture', game: 'Azul', startsAt: '2031-06-20T14:00:00.000Z',
    city: 'Madrid', zone: 'Centro', place: 'Café Mesa', description: '', capacity: 6,
    organizerId: 'belial', participantIds: ['belial'], requests: [], lifecycle: 'scheduled', tone: 'forest',
  }
  const requests = requestsFor(people.slice(0, count).map(({ id }) => id), session.id)
  const sessionRepository = {
    observeAll: (observer: SessionObserver<readonly GameSession[]>) => {
      observer.next([session])
      return () => {}
    },
  } as GameSessionRepository
  const requestRepository = {
    observeForPlayer: (_id: string, observer: SessionObserver<readonly ParticipationRequest[]>) => {
      observer.next([])
      return () => {}
    },
    observePendingForSession: (_id: string, observer: SessionObserver<readonly ParticipationRequest[]>) => {
      emitRequests = (next) => observer.next(next)
      observer.next(requests)
      return () => { emitRequests = null }
    },
  } as ParticipationRequestRepository
  const playerRepository = {
    getById: async (id: string) => people.find((person) => person.id === id) ?? null,
  } as PlayerRepository
  const reviewRepository = {
    getReceivedBy: async (id: string) => id === 'rated' ? [{
      id: 'review-rated', sessionId: 'past-fixture', reviewerId: 'another', reviewedPlayerId: 'rated',
      rating: 4, createdAt: '2026-01-01T00:00:00.000Z',
    }] : [],
    getBySessionAndReviewer: async () => [],
  } as PlayerReviewRepository
  container = document.createElement('div')
  container.id = 'organizer-requests-fixture'
  document.body.append(container)
  root = createRoot(container)
  root.render(createElement(PrototypeProvider, {
    currentPlayer: { id: 'belial', displayName: 'Belial', city: 'Madrid' },
    sessionRepository, participationRequestRepository: requestRepository, playerRepository,
  }, createElement(PlayerTrustProvider, { repository: reviewRepository },
    createElement(MemoryRouter, { initialEntries: [`/sessions/${session.id}`] },
      createElement(Routes, null, createElement(Route, {
        path: '/sessions/:sessionId', element: createElement(SessionDetailPage),
      }))))))
  await until(() => container?.querySelectorAll('.request-card').length === count
    && container?.textContent?.includes(count === 0 ? 'No tienes solicitudes pendientes' : `${count} ${count === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}`) === true,
  `${count} organizer requests`)
  if (count > 0) await until(() => container?.querySelectorAll('.request-card .request-card__reputation small').length === count, 'trust summaries')
  return {
    count: container.querySelectorAll('.request-card').length,
    visibleCount: [...container.querySelectorAll('.request-card')].filter((card) => getComputedStyle(card).display !== 'none').length,
    hasAccordion: Boolean(container.querySelector('summary')),
    rated: container.textContent?.includes('4,0/5') ?? false,
    newPlayer: container.textContent?.includes('Nuevo en Mesa Abierta · Sin valoraciones todavía') ?? false,
    biographyLabeled: container.textContent?.includes('Descripción del perfil:') ?? false,
    hasManagementActions: container.textContent?.includes('Gestión de la partida') ?? false,
    horizontalOverflow: container.scrollWidth > container.clientWidth,
  }
}

export const setOrganizerFixtureRequestIds = async (ids: readonly string[]) => {
  if (!emitRequests || !container) throw new Error('Organizer fixture is not mounted')
  emitRequests(requestsFor(ids, 'organizer-requests-fixture'))
  await until(() => container?.querySelectorAll('.request-card').length === ids.length
    && container?.textContent?.includes(ids.length === 0
      ? 'No tienes solicitudes pendientes'
      : `${ids.length} ${ids.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}`) === true,
  'updated organizer requests')
  return {
    names: [...container.querySelectorAll('.request-card .person-row strong')].map((item) => item.textContent),
    visibleCount: [...container.querySelectorAll('.request-card')].filter((card) => getComputedStyle(card).display !== 'none').length,
    more: container.querySelector('.organizer-management__more')?.textContent?.trim() ?? null,
  }
}

export const checkOrganizerRequestDensity = async () => {
  const wide = matchMedia('(min-width: 68rem)').matches
  const counts = wide ? [0, 1, 2, 3, 4, 5, 10] : [0, 1, 2, 3, 4, 5, 7]
  const results: string[] = []
  try {
    for (const count of counts) {
      const result = await mountOrganizerRequestsFixture(count)
      const list = container?.querySelector('.organizer-management .request-list')
      const more = container?.querySelector<HTMLButtonElement>('.organizer-management__more')
      const expectedVisible = wide ? count : Math.min(count, 3)
      if (result.visibleCount !== expectedVisible || result.horizontalOverflow) {
        throw new Error(`Wrong visible count or horizontal overflow: ${count} ${JSON.stringify(result)}`)
      }
      if (count > 0 && !list) throw new Error(`Missing request list for ${count}`)
      if (wide && list) {
        if (getComputedStyle(list).overflowY !== 'auto') throw new Error('Wide list is not scrollable')
        if (count === 2 && innerHeight >= 900 && list.scrollHeight > list.clientHeight) {
          throw new Error('Two short requests should not scroll in a tall desktop viewport')
        }
        if (count >= 5 && list.scrollHeight <= list.clientHeight) throw new Error(`${count} requests should scroll`)
        if (list.contains(container?.querySelector('.detail-organizer-actions') ?? null)) {
          throw new Error('Session management actions must stay outside the scroll region')
        }
      } else if (!wide && list && getComputedStyle(list).overflowY !== 'visible') {
        throw new Error('Narrow list has nested vertical scrolling')
      }
      if (!wide && count > 3) {
        const remaining = count - 3
        if (more?.textContent?.trim() !== `Ver ${remaining} ${remaining === 1 ? 'solicitud' : 'solicitudes'} más`) {
          throw new Error(`Wrong remaining count for ${count}`)
        }
        if (count === 7) {
          more.click()
          await until(() => [...container?.querySelectorAll('.request-card') ?? []]
            .filter((card) => getComputedStyle(card).display !== 'none').length === 6,
          'six visible requests')
          if (more.textContent?.trim() !== 'Ver 1 solicitud más') throw new Error('Wrong count after first expansion')
          more.click()
          await until(() => [...container?.querySelectorAll('.request-card') ?? []]
            .filter((card) => getComputedStyle(card).display !== 'none').length === 7,
          'seven visible requests')
          if (more.textContent?.trim() !== 'Mostrar menos') throw new Error('Last expansion lost its focusable control')
        }
      } else if (more && getComputedStyle(more).display !== 'none') {
        throw new Error(`Unexpected visible more control for ${count}`)
      }
      results.push(`${count}:${result.visibleCount}`)
    }

    if (!wide) {
      const withoutIvy = ['rated', 'no-bio', 'long-bio', 'extra-1', 'extra-2', 'extra-3']
      const reduced = await setOrganizerFixtureRequestIds(withoutIvy)
      if (reduced.visibleCount !== 6 || reduced.names.includes('Ivy') || reduced.more !== 'Mostrar menos') {
        throw new Error(`Wrong realtime removal: ${JSON.stringify(reduced)}`)
      }
      const withNewRequest = await setOrganizerFixtureRequestIds([...withoutIvy, 'extra-4'])
      if (withNewRequest.visibleCount !== 6 || withNewRequest.more !== 'Ver 1 solicitud más') {
        throw new Error(`Wrong realtime addition: ${JSON.stringify(withNewRequest)}`)
      }
      const more = container?.querySelector<HTMLButtonElement>('.organizer-management__more')
      more?.click()
      await until(() => [...container?.querySelectorAll('.request-card') ?? []]
        .filter((card) => getComputedStyle(card).display !== 'none').length === 7,
      'new seventh request visible')
    }
    return { wide, counts: results, realtimeUpdated: !wide }
  } finally {
    unmountOrganizerRequestsFixture()
  }
}

export const checkFocusedMoreRemoved = async () => {
  try {
    await mountOrganizerRequestsFixture(4)
    const more = container?.querySelector<HTMLButtonElement>('.organizer-management__more')
    if (!more) throw new Error('Missing mobile disclosure control')
    more.focus()
    if (document.activeElement !== more) throw new Error('Could not focus mobile disclosure control')
    await setOrganizerFixtureRequestIds(['rated', 'new', 'no-bio'])
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    if (document.activeElement !== container?.querySelector('.organizer-management h2')) {
      throw new Error(`Focus not restored after disclosure disappears: ${document.activeElement?.outerHTML}`)
    }
    return { focusRestored: true, remainingRequests: container?.querySelectorAll('.request-card').length }
  } finally {
    unmountOrganizerRequestsFixture()
  }
}
