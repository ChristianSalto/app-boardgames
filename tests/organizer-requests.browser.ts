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
] as const

let root: Root | null = null
let container: HTMLElement | null = null

const until = (predicate: () => boolean, label: string) => new Promise<void>((resolve, reject) => {
  if (predicate()) { resolve(); return }
  const observer = new MutationObserver(() => {
    if (!predicate()) return
    clearTimeout(timeout)
    observer.disconnect()
    resolve()
  })
  observer.observe(document.body, { childList: true, characterData: true, subtree: true })
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
}

export const mountOrganizerRequestsFixture = async (count: 0 | 1 | 2 | 4) => {
  unmountOrganizerRequestsFixture()
  const session: GameSession = {
    id: 'organizer-requests-fixture', game: 'Azul', startsAt: '2031-06-20T14:00:00.000Z',
    city: 'Madrid', zone: 'Centro', place: 'Café Mesa', description: '', capacity: 6,
    organizerId: 'belial', participantIds: ['belial'], requests: [], lifecycle: 'scheduled', tone: 'forest',
  }
  const requests: ParticipationRequest[] = people.slice(0, count).map(({ id }) => ({
    id: `${session.id}_${id}`, sessionId: session.id, playerId: id, status: 'pending',
  }))
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
      observer.next(requests)
      return () => {}
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
    hasAccordion: Boolean(container.querySelector('summary')),
    rated: container.textContent?.includes('4,0/5') ?? false,
    newPlayer: container.textContent?.includes('Nuevo en Mesa Abierta · Sin valoraciones todavía') ?? false,
    biographyLabeled: container.textContent?.includes('Descripción del perfil:') ?? false,
    hasManagementActions: container.textContent?.includes('Gestión de la partida') ?? false,
    horizontalOverflow: container.scrollWidth > container.clientWidth,
  }
}
