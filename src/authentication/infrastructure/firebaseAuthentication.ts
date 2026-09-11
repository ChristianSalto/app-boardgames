import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import type {
  AuthenticatedUser,
  AuthenticationErrorCode,
  AuthenticationGateway,
  AuthenticationResult,
  EmailCredentials,
} from '../application/authentication'

const toAuthenticatedUser = (user: User): AuthenticatedUser => ({
  id: user.uid,
  email: user.email ?? '',
})

const invalidRestoredSessionCodes = new Set([
  'auth/invalid-credential',
  'auth/invalid-id-token',
  'auth/invalid-user-token',
  'auth/user-disabled',
  'auth/user-not-found',
  'auth/user-token-expired',
  'auth/user-token-revoked',
])

const getFirebaseErrorCode = (error: unknown) => (
  error instanceof Error && 'code' in error && typeof error.code === 'string'
    ? error.code
    : ''
)

const validateRestoredUser = async (auth: Auth, user: User) => {
  try {
    await user.getIdToken(true)
    await user.reload()
    return toAuthenticatedUser(user)
  } catch (error) {
    if (invalidRestoredSessionCodes.has(getFirebaseErrorCode(error))) {
      await signOut(auth).catch(() => undefined)
      return null
    }

    return toAuthenticatedUser(user)
  }
}

const toAuthenticationError = (code: string): AuthenticationErrorCode => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'email-already-in-use'
    case 'auth/invalid-email':
      return 'invalid-email'
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'invalid-credentials'
    case 'auth/network-request-failed':
      return 'network'
    case 'auth/too-many-requests':
      return 'too-many-attempts'
    case 'auth/weak-password':
      return 'weak-password'
    default:
      return 'unexpected'
  }
}

const createResult = async (
  operation: () => Promise<User>,
): Promise<AuthenticationResult> => {
  try {
    return { ok: true, user: toAuthenticatedUser(await operation()) }
  } catch (error) {
    return { ok: false, error: toAuthenticationError(getFirebaseErrorCode(error)) }
  }
}

export const createFirebaseAuthenticationGateway = (
  auth: Auth,
): AuthenticationGateway => ({
  registerWithEmail: ({ email, password }: EmailCredentials) =>
    createResult(async () => (await createUserWithEmailAndPassword(auth, email, password)).user),
  loginWithEmail: ({ email, password }: EmailCredentials) =>
    createResult(async () => (await signInWithEmailAndPassword(auth, email, password)).user),
  logout: async () => {
    try {
      await signOut(auth)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: toAuthenticationError(getFirebaseErrorCode(error)) }
    }
  },
  observeAuthState: (listener) => onAuthStateChanged(auth, (user) => {
    if (!user) {
      listener(null)
      return
    }

    void validateRestoredUser(auth, user).then(listener)
  }, () => {
    listener(null)
  }),
})
