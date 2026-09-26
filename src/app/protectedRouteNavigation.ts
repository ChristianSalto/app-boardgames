export type ProtectedRouteDestination = Readonly<{
  pathname: string
  search: string
  hash: string
}>

type RedirectInstruction = Readonly<{
  to: string | ProtectedRouteDestination
  replace: true
  state?: Readonly<{ from: ProtectedRouteDestination }>
}>

const protectedPathPatterns = [
  /^\/(?:my-sessions|create|profile)$/,
  /^\/sessions\/[^/]+(?:\/(?:edit|reviews))?$/,
  /^\/players\/[^/]+(?:\/reviews)?$/,
  /^\/listings(?:\/(?:my|create|[^/]+(?:\/edit)?))?$/,
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const getProtectedRouteDestination = (value: unknown): ProtectedRouteDestination | null => {
  if (!isRecord(value) || typeof value.pathname !== 'string') return null

  const pathname = value.pathname
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (
    !pathname.startsWith('/')
    || pathname.startsWith('//')
    || pathname.includes('\\')
    || /%2f|%5c/i.test(pathname)
    || !protectedPathPatterns.some((pattern) => pattern.test(normalizedPath))
  ) return null

  const search = typeof value.search === 'string' && (value.search === '' || value.search.startsWith('?'))
    ? value.search
    : ''
  const hash = typeof value.hash === 'string' && (value.hash === '' || value.hash.startsWith('#'))
    ? value.hash
    : ''

  return { pathname: normalizedPath, search, hash }
}

export const getReturnDestination = (locationState: unknown): ProtectedRouteDestination | null => {
  if (!isRecord(locationState)) return null
  return getProtectedRouteDestination(locationState.from)
}

export const getPostAuthenticationRedirect = (
  locationState: unknown,
  profileMissing: boolean,
): RedirectInstruction => {
  const destination = getReturnDestination(locationState)
  if (profileMissing) {
    return {
      to: '/complete-profile',
      replace: true,
      ...(destination ? { state: { from: destination } } : {}),
    }
  }

  return { to: destination ?? '/', replace: true }
}

export const getPostProfileRedirect = (locationState: unknown): RedirectInstruction => ({
  to: getReturnDestination(locationState) ?? '/',
  replace: true,
})
