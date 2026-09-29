import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PrototypeProvider, usePrototype } from '../src/app/PrototypeContext.tsx'
import type { GameSessionRepository } from '../src/game-sessions/application/gameSessionRepository.ts'
import type { ParticipationRequestRepository } from '../src/game-sessions/application/participationRequestRepository.ts'
import type { SessionObserver } from '../src/game-sessions/application/sessionObservation.ts'
import type { GameSession } from '../src/game-sessions/types.ts'
import { SessionDetailPage } from '../src/game-sessions/SessionDetailPage.tsx'
import type { PlayerRepository } from '../src/players/application/playerRepository.ts'
import { PlayerTrustProvider } from '../src/player-trust/presentation/PlayerTrustProvider.tsx'
import type { PlayerReviewRepository } from '../src/player-trust/application/playerTrustRepository.ts'

const session: GameSession = {
  id: 'delayed-profile-session',
  game: 'Azul',
  startsAt: '2031-06-20T14:00:00.000Z',
  city: 'Madrid',
  zone: 'Centro',
  place: 'Café Mesa',
  description: '',
  capacity: 4,
  organizerId: 'redon',
  participantIds: ['redon', 'stalled'],
  requests: [],
  lifecycle: 'scheduled',
  tone: 'forest',
}

const Probe = () => {
  const { players, sessions, sessionsLoading } = usePrototype()
  return createElement('p', { id: 'delayed-profile-result' },
    `${sessionsLoading ? 'loading' : 'ready'}:${sessions.length}:${players.find((player) => player.id === 'redon')?.displayName ?? 'unresolved'}`)
}

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
  }, 1500)
})

export const checkDelayedProfileDoesNotBlockSessions = async () => {
  let sessionObserver: SessionObserver<readonly GameSession[]> | null = null
  const sessionRepository = {
    observeAll: (observer: SessionObserver<readonly GameSession[]>) => {
      sessionObserver = observer
      observer.next([])
      return () => {}
    },
  } as GameSessionRepository
  const requestRepository = {
    observeForPlayer: (_playerId: string, observer: SessionObserver<readonly never[]>) => {
      observer.next([])
      return () => {}
    },
    observePendingForSession: (_sessionId: string, observer: SessionObserver<readonly never[]>) => {
      observer.next([])
      return () => {}
    },
  } as ParticipationRequestRepository
  const playerRepository = {
    getById: (id: string) => id === 'redon'
      ? Promise.resolve({ id, displayName: 'Redon', city: 'Madrid' })
      : new Promise<never>(() => {}),
  } as PlayerRepository
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  try {
    root.render(createElement(PrototypeProvider, {
      currentPlayer: { id: 'belial', displayName: 'Belial', city: 'Madrid' },
      sessionRepository,
      participationRequestRepository: requestRepository,
      playerRepository,
    }, createElement(Probe)))
    await until(() => document.getElementById('delayed-profile-result')?.textContent === 'ready:0:unresolved', 'initial feed')
    sessionObserver?.next([session])
    await until(() => document.getElementById('delayed-profile-result')?.textContent === 'ready:1:Redon', 'session and available profile update while another profile is unresolved')
  } finally {
    root.unmount()
    container.remove()
  }
}

export const checkUnidentifiedRequestsCannotBeResolved = async () => {
  const organizedSession = { ...session, organizerId: 'belial', participantIds: ['belial'] }
  const requests = ['first', 'second'].map((playerId) => ({
    id: `${session.id}_${playerId}`,
    sessionId: session.id,
    playerId,
    status: 'pending' as const,
  }))
  const sessionRepository = {
    observeAll: (observer: SessionObserver<readonly GameSession[]>) => {
      observer.next([organizedSession])
      return () => {}
    },
  } as GameSessionRepository
  const requestRepository = {
    observeForPlayer: (_playerId: string, observer: SessionObserver<readonly never[]>) => {
      observer.next([])
      return () => {}
    },
    observePendingForSession: (_sessionId: string, observer: SessionObserver<typeof requests>) => {
      observer.next(requests)
      return () => {}
    },
  } as ParticipationRequestRepository
  let secondLookups = 0
  const playerRepository = {
    getById: (id: string) => {
      if (id !== 'second') return new Promise<never>(() => {})
      secondLookups += 1
      return secondLookups === 1
        ? Promise.reject(new Error('Profile temporarily unavailable'))
        : Promise.resolve({ id, displayName: 'Second Tester', city: 'Madrid' })
    },
  } as PlayerRepository
  const reviewRepository = {
    getReceivedBy: async () => [],
    getBySessionAndReviewer: async () => [],
  } as PlayerReviewRepository
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  try {
    root.render(createElement(PrototypeProvider, {
      currentPlayer: { id: 'belial', displayName: 'Belial', city: 'Madrid' },
      sessionRepository,
      participationRequestRepository: requestRepository,
      playerRepository,
    }, createElement(PlayerTrustProvider, { repository: reviewRepository },
      createElement(MemoryRouter, { initialEntries: [`/sessions/${session.id}`] },
        createElement(Routes, null,
          createElement(Route, { path: '/sessions/:sessionId', element: createElement(SessionDetailPage) }))))))
    await until(() => container.textContent?.includes('2 solicitudes pendientes') ?? false, 'pending organizer requests')
    await until(() => container.querySelectorAll('.request-card').length === 2, 'two request cards')
    if (container.querySelector('summary') || !container.querySelector('ul[aria-label="Solicitudes pendientes"]')) {
      throw new Error('Pending requests must be directly visible as a named list')
    }
    const actionLabels = [...container.querySelectorAll('.request-card button')].map((button) => button.textContent?.trim())
    if (actionLabels.includes('Aceptar solicitud') || actionLabels.includes('Rechazar') || actionLabels.includes('Sí, rechazar')) {
      throw new Error('Unidentified requests expose resolution actions')
    }
    if (actionLabels.filter((label) => label === 'Reintentar carga del perfil').length !== 2) {
      throw new Error('Unidentified requests need a per-profile recovery action')
    }
    const cards = [...container.querySelectorAll('.request-card')]
    await until(() => cards[1]?.textContent?.includes('No hemos podido cargar este perfil') ?? false, 'automatic profile error')
    const retry = [...cards[1].querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Reintentar carga del perfil')
    retry?.click()
    await until(() => cards[1]?.textContent?.includes('Second Tester') ?? false, 'retried profile')
    if (cards[0]?.textContent?.includes('Aceptar solicitud') || !cards[1]?.textContent?.includes('Aceptar solicitud')) {
      throw new Error('Only identified requests may expose resolution actions')
    }
  } finally {
    root.unmount()
    container.remove()
  }
}
