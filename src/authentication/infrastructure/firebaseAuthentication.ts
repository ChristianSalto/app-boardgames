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
    const code = error instanceof Error && 'code' in error && typeof error.code === 'string'
      ? error.code
      : ''
    return { ok: false, error: toAuthenticationError(code) }
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
      const code = error instanceof Error && 'code' in error && typeof error.code === 'string'
        ? error.code
        : ''
      return { ok: false, error: toAuthenticationError(code) }
    }
  },
  observeAuthState: (listener) => onAuthStateChanged(auth, (user) => {
    listener(user ? toAuthenticatedUser(user) : null)
  }, () => {
    listener(null)
  }),
})
