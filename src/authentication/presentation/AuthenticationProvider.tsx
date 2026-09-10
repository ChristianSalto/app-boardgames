import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  loginWithEmail,
  logout,
  observeAuthState,
  registerWithEmail,
  type AuthenticatedUser,
  type AuthenticationGateway,
  type AuthenticationResult,
  type EmailCredentials,
} from '../application/authentication'

type AuthenticationContextValue = Readonly<{
  status: 'resolving' | 'authenticated' | 'unauthenticated'
  user: AuthenticatedUser | null
  register: (credentials: EmailCredentials) => Promise<AuthenticationResult>
  login: (credentials: EmailCredentials) => Promise<AuthenticationResult>
  logout: () => Promise<AuthenticationResult | Readonly<{ ok: true }>>
}>

const AuthenticationContext = createContext<AuthenticationContextValue | undefined>(undefined)

export function AuthenticationProvider({
  children,
  gateway,
}: {
  readonly children: ReactNode
  readonly gateway: AuthenticationGateway
}) {
  const [status, setStatus] = useState<AuthenticationContextValue['status']>('resolving')
  const [user, setUser] = useState<AuthenticatedUser | null>(null)

  useEffect(() => observeAuthState(gateway, (nextUser) => {
    setUser(nextUser)
    setStatus(nextUser ? 'authenticated' : 'unauthenticated')
  }), [gateway])

  const register = useCallback(
    (credentials: EmailCredentials) => registerWithEmail(gateway, credentials),
    [gateway],
  )
  const login = useCallback(
    (credentials: EmailCredentials) => loginWithEmail(gateway, credentials),
    [gateway],
  )
  const logoutCurrentUser = useCallback(() => logout(gateway), [gateway])

  const value = useMemo<AuthenticationContextValue>(() => ({
    status,
    user,
    register,
    login,
    logout: logoutCurrentUser,
  }), [login, logoutCurrentUser, register, status, user])

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  )
}

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext)
  if (!context) {
    throw new Error('useAuthentication must be used inside AuthenticationProvider')
  }
  return context
}
