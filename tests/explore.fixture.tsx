import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from '../src/app/App'
import { AuthenticationProvider } from '../src/authentication/presentation/AuthenticationProvider'
import { CurrentPlayerProvider } from '../src/players/presentation/CurrentPlayerProvider'
import { cacheGameCatalog } from '../src/games/application/gameCatalogRepository'
import { searchGames } from '../src/games/application/searchGames'
import '../src/styles/main.scss'

// All adapters are local fixtures; unexpected writes fail immediately.
const unsupported = () => { throw new Error('Unsupported fixture operation') }
const base = { startsAt: '2031-06-20T14:00:00.000Z', city: 'Madrid', zone: 'Centro', place: 'Café Mesa', description: '', capacity: 4, organizerId: 'host', participantIds: ['host'], requests: [], lifecycle: 'scheduled', tone: 'forest' }
const sessions = [
  { ...base, id: 'cataloged', game: 'Catan', gameId: 'catan' },
  { ...base, id: 'historical', game: '  CATÁN  ' },
  { ...base, id: 'wrong-id', game: 'Catan', gameId: 'other' },
  { ...base, id: 'textual', game: 'Catan casero', zone: 'Retiro' },
  { ...base, id: 'alias', game: 'Ticket to Ride', gameId: 'ticket-to-ride' },
  ...Array.from({length: 12}, (_, i) => ({ ...base, id: 'extra-'+i, game: 'Azul', gameId: 'azul' })),
]
const listeners = new Set()
const catalog = [{ id: 'catan', name: 'Catan' }, {id:'azul',name:'Azul'}, { id: 'ticket-to-ride', name: 'Ticket to Ride', aliases: ['Aventureros al Tren'] }]
let reads = 0
let catalogFailure = new URLSearchParams(location.search).has('catalogError')
const repository = cacheGameCatalog({ list: async () => { reads++; if (catalogFailure) throw new Error('Fixture catalog failure'); return catalog } })
const searchGameCatalog = (query) => searchGames(repository, query)
const playerRepository = { getById: async (id) => ({id, displayName: id === 'host' ? 'Ana' : 'Chris', city:'Madrid'}), create: unsupported }
const gateway = { observeAuthState: (listener) => {listener({id:'viewer',email:'local@example.test'}); return () => {}}, loginWithEmail: unsupported, registerWithEmail: unsupported, logout: unsupported }
const sessionRepository = {
  observeAll: (observer) => { listeners.add(observer); observer.next(sessions); return () => listeners.delete(observer) },
  discover: async () => sessions, getById: async (id) => sessions.find(s => s.id === id) ?? null,
  getOrganizedBy: async () => [], create: unsupported, update: unsupported, cancel: unsupported,
}
const emptyObserver = (...args) => {args.at(-1).next([]); return () => {}}
window.exploreFixture = {
  reads: () => reads,
  setCatalogFailure: (value) => { catalogFailure = value },
  emit: (items) => listeners.forEach(observer => observer.next(items)),
  sessions,
}
createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/tests/explore.fixture.html">
    <AuthenticationProvider gateway={gateway}>
      <CurrentPlayerProvider repository={playerRepository}>
        <App gameSessionRepository={sessionRepository} searchGameCatalog={searchGameCatalog} loadGameCatalog={repository.list}
          participationRequestRepository={{observeForPlayer:emptyObserver,observePendingForSession:emptyObserver}}
          playerRepository={playerRepository}
          gameListingRepository={{discoverActive:async()=>[],getByOwnerId:async()=>[]}}
          listingInterestRepository={{}} listingImageRepository={{}}
          listingCommandDependencies={{createId:unsupported,now:()=> '2031-06-01T00:00:00.000Z'}}
          playerReviewRepository={{getReceivedBy:async()=>[],getBySessionAndReviewer:async()=>[]}}
          registrationEnabled={false} />
      </CurrentPlayerProvider>
    </AuthenticationProvider>
  </BrowserRouter>,
)
