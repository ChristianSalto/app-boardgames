import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AuthPageLayout } from '../../shared/AuthPageLayout'
import { checkBetaAccess, type BetaAccessRepository } from '../application/betaAccess'
import { useAuthentication } from './AuthenticationProvider'

type BetaAccessStatus = 'idle' | 'checking' | 'authorized' | 'denied' | 'error'

export function ClosedBetaGuard({
  children,
  enabled,
  repository,
}: {
  readonly children: ReactNode
  readonly enabled: boolean
  readonly repository: BetaAccessRepository
}) {
  const { status: authenticationStatus, user, logout } = useAuthentication()
  const [status, setStatus] = useState<BetaAccessStatus>(enabled ? 'idle' : 'authorized')
  const verificationIdRef = useRef(0)

  const verifyAccess = useCallback(async () => {
    if (!enabled || authenticationStatus !== 'authenticated' || !user) return

    const verificationId = ++verificationIdRef.current
    setStatus('checking')
    try {
      const isAuthorized = await checkBetaAccess(repository, user.id)
      if (verificationId !== verificationIdRef.current) return
      setStatus(isAuthorized ? 'authorized' : 'denied')
    } catch {
      if (verificationId !== verificationIdRef.current) return
      setStatus('error')
    }
  }, [authenticationStatus, enabled, repository, user])

  useEffect(() => {
    if (!enabled) {
      verificationIdRef.current += 1
      setStatus('authorized')
      return
    }

    if (authenticationStatus !== 'authenticated' || !user) {
      verificationIdRef.current += 1
      setStatus('idle')
      return
    }

    void verifyAccess()
    return () => {
      verificationIdRef.current += 1
    }
  }, [authenticationStatus, enabled, user, verifyAccess])

  if (!enabled || authenticationStatus !== 'authenticated') return children
  if (status === 'authorized') return children

  if (status === 'denied') {
    return (
      <AuthPageLayout
        brandHref={null}
        cardClassName="auth-card--failure"
        description="Esta versión está disponible únicamente para las personas invitadas a la beta privada."
        eyebrow="Acceso limitado"
        title="Beta cerrada"
      >
        <div className="form-card auth-form auth-form--branded auth-failure-actions">
          <button className="button button--secondary button--wide" onClick={() => { void logout() }} type="button">
            Cerrar sesión
          </button>
        </div>
      </AuthPageLayout>
    )
  }

  if (status === 'error') {
    return (
      <AuthPageLayout
        brandHref={null}
        cardClassName="auth-card--failure"
        description="Comprueba tu conexión e inténtalo de nuevo."
        eyebrow="Acceso a la beta"
        title="No hemos podido comprobar tu acceso"
      >
        <div className="form-card auth-form auth-form--branded auth-failure-actions">
          <button className="button button--primary button--wide auth-submit" onClick={() => { void verifyAccess() }} type="button">
            Reintentar
          </button>
          <button className="button button--secondary button--wide" onClick={() => { void logout() }} type="button">
            Cerrar sesión
          </button>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <main className="auth-state" aria-live="polite">
      <p>Comprobando tu acceso a la beta…</p>
    </main>
  )
}
