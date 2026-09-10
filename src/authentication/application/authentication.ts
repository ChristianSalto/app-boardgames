export type AuthenticatedUser = Readonly<{
  id: string
  email: string
}>

export type EmailCredentials = Readonly<{
  email: string
  password: string
}>

export type AuthenticationErrorCode =
  | 'email-already-in-use'
  | 'invalid-credentials'
  | 'invalid-email'
  | 'network'
  | 'too-many-attempts'
  | 'weak-password'
  | 'unexpected'

export type AuthenticationResult =
  | Readonly<{ ok: true; user: AuthenticatedUser }>
  | Readonly<{ ok: false; error: AuthenticationErrorCode }>

export type AuthenticationGateway = Readonly<{
  registerWithEmail: (credentials: EmailCredentials) => Promise<AuthenticationResult>
  loginWithEmail: (credentials: EmailCredentials) => Promise<AuthenticationResult>
  logout: () => Promise<AuthenticationResult | Readonly<{ ok: true }>>
  observeAuthState: (listener: (user: AuthenticatedUser | null) => void) => () => void
}>

export const registerWithEmail = (
  gateway: AuthenticationGateway,
  credentials: EmailCredentials,
) => gateway.registerWithEmail(credentials)

export const loginWithEmail = (
  gateway: AuthenticationGateway,
  credentials: EmailCredentials,
) => gateway.loginWithEmail(credentials)

export const logout = (gateway: AuthenticationGateway) => gateway.logout()

export const observeAuthState = (
  gateway: AuthenticationGateway,
  listener: (user: AuthenticatedUser | null) => void,
) => gateway.observeAuthState(listener)
