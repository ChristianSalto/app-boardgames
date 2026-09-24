import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, doc, setDoc } from 'firebase/firestore'
import { madridCivilToInstant } from '../src/game-sessions/madridDateTime.ts'

const projectId = 'demo-mesa-abierta'
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080'
const authHost = process.env.AUTH_EMULATOR_HOST ?? '127.0.0.1:9099'
const reviewSessionId = process.env.REVIEW_SESSION_ID ?? 'review-flow-session'
const developmentPassword = 'MesaAbiertaReview123!'

const parseLocalHost = (value, service) => {
  const [host, portText] = value.split(':')
  const port = Number(portText)
  if (!['127.0.0.1', 'localhost'].includes(host) || !Number.isInteger(port)) {
    throw new Error(`La semilla solo puede ejecutarse contra ${service} Emulator local.`)
  }
  return { host, port }
}

const firestore = parseLocalHost(firestoreHost, 'Firestore')
const auth = parseLocalHost(authHost, 'Auth')

const emulatorAuthRequest = async (endpoint, payload) => {
  const response = await fetch(`http://${auth.host}:${auth.port}/identitytoolkit.googleapis.com/v1/${endpoint}?key=local-review-seed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message ?? 'Auth Emulator no ha podido crear la cuenta de prueba.')
  return data
}

const createOrReuseLocalAccount = async (email) => {
  try {
    const account = await emulatorAuthRequest('accounts:signUp', {
      email,
      password: developmentPassword,
      returnSecureToken: true,
    })
    return account.localId
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'EMAIL_EXISTS') throw error
    const account = await emulatorAuthRequest('accounts:signInWithPassword', {
      email,
      password: developmentPassword,
      returnSecureToken: true,
    })
    return account.localId
  }
}

const organizerEmail = 'review-organizer@mesa-abierta.local'
const participantEmail = 'review-player@mesa-abierta.local'
const organizerId = await createOrReuseLocalAccount(organizerEmail)
const participantId = await createOrReuseLocalAccount(participantEmail)
const seededStart = madridCivilToInstant('2026-01-20', '18:30')
if (!seededStart.ok) throw new Error('La fecha de la sesión semilla no es válida en Europe/Madrid.')

const testEnvironment = await initializeTestEnvironment({
  projectId,
  firestore,
})

try {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore()
    await Promise.all([
      setDoc(doc(database, 'players', organizerId), {
        displayName: 'Olivia Organizadora',
        city: 'Madrid',
        district: 'Chamberí',
        description: 'Cuenta local para validar el flujo de valoraciones.',
      }),
      setDoc(doc(database, 'players', participantId), {
        displayName: 'Pablo Participante',
        city: 'Madrid',
        district: 'Retiro',
        description: 'Cuenta local para validar el flujo de valoraciones.',
      }),
      setDoc(doc(database, 'gameSessions', reviewSessionId), {
        gameName: 'Azul',
        startsAt: Timestamp.fromDate(new Date(seededStart.instant)),
        date: '2026-01-20',
        time: '18:30',
        city: 'Madrid',
        district: 'Chamberí',
        venue: 'Mesa de prueba local',
        description: 'Partida pasada exclusiva para probar valoraciones locales.',
        capacity: 4,
        organizerId,
        participantIds: [organizerId, participantId],
        pendingRequestIds: [],
        status: 'scheduled',
      }),
    ])
  })

  console.log(`Sesión pasada ${reviewSessionId} creada en Firestore Emulator (${projectId}).`)
  console.log(`Organizador: ${organizerEmail}`)
  console.log(`Participante: ${participantEmail}`)
  console.log(`Contraseña local de ambas cuentas: ${developmentPassword}`)
} finally {
  await testEnvironment.cleanup()
}
