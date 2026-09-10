import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'

const localProjectId = 'demo-mesa-abierta'
const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST ?? '127.0.0.1'

const firebaseOptions: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? `${localProjectId}.local`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? localProjectId,
}

export type FirebaseInfrastructure = Readonly<{
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
}>

export const initializeFirebaseInfrastructure = (): FirebaseInfrastructure => {
  const hasExistingApp = getApps().length > 0
  const app = hasExistingApp ? getApp() : initializeApp(firebaseOptions)
  const auth = getAuth(app)
  const firestore = getFirestore(app)

  if (!hasExistingApp && import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS !== 'false') {
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true })
    connectFirestoreEmulator(firestore, emulatorHost, 8080)
  }

  return { app, auth, firestore }
}
