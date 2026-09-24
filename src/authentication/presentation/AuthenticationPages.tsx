import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthPageLayout } from '../../shared/AuthPageLayout'
import type { AuthenticationErrorCode } from '../application/authentication'
import { useAuthentication } from './AuthenticationProvider'

type FormErrors = {
  email?: string
  password?: string
  passwordConfirmation?: string
  form?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const errorMessages: Record<AuthenticationErrorCode, string> = {
  'email-already-in-use': 'Ya existe una cuenta con este correo electrónico.',
  'invalid-credentials': 'El correo o la contraseña no son correctos.',
  'invalid-email': 'Escribe un correo electrónico válido.',
  network: 'No se ha podido conectar. Comprueba que los emuladores están en marcha e inténtalo de nuevo.',
  'too-many-attempts': 'Hay demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
  'weak-password': 'La contraseña no cumple los requisitos de seguridad.',
  unexpected: 'No hemos podido completar la operación. Inténtalo de nuevo.',
}

const validateCredentials = (email: string, password: string): FormErrors => {
  const errors: FormErrors = {}
  if (!email.trim()) {
    errors.email = 'Escribe tu correo electrónico.'
  } else if (!emailPattern.test(email.trim())) {
    errors.email = 'Escribe un correo electrónico válido.'
  }
  if (!password) {
    errors.password = 'Escribe tu contraseña.'
  }
  return errors
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon({ isVisible }: { readonly isVisible: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {isVisible ? null : <path d="m4 4 16 16" />}
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  )
}

export function LoginPage({ registrationEnabled }: { readonly registrationEnabled: boolean }) {
  const { login } = useAuthentication()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateCredentials(email, password)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const result = await login({ email: email.trim(), password })
    setIsSubmitting(false)
    if (!result.ok) setErrors({ form: errorMessages[result.error] })
  }

  return (
    <AuthPageLayout
      cardClassName="auth-card--login"
      description="Inicia sesión para organizar partidas y solicitar plaza en Mesa Abierta."
      eyebrow="Comunidad de juegos de mesa"
      title="Bienvenido de nuevo"
    >
      <form className="form-card auth-form auth-form--branded" noValidate onSubmit={handleSubmit}>
        {errors.form ? <div className="error-summary" role="alert"><p>{errors.form}</p></div> : null}
        <div className="field">
          <label className="field__label" htmlFor="login-email">Correo electrónico</label>
          <div className="auth-control">
            <span className="auth-control__leading-icon"><MailIcon /></span>
            <input
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              id="login-email"
              onChange={(event) => { setEmail(event.target.value); setErrors({}) }}
              placeholder="tu@correo.com"
              type="email"
              value={email}
            />
          </div>
          {errors.email ? <p className="field__error" id="login-email-error">{errors.email}</p> : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="login-password">Contraseña</label>
          <div className="auth-control">
            <span className="auth-control__leading-icon"><LockIcon /></span>
            <input
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
              id="login-password"
              onChange={(event) => { setPassword(event.target.value); setErrors({}) }}
              placeholder="Tu contraseña"
              type={isPasswordVisible ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={isPasswordVisible}
              className="auth-control__visibility"
              onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
              type="button"
            >
              <EyeIcon isVisible={isPasswordVisible} />
            </button>
          </div>
          {errors.password ? <p className="field__error" id="login-password-error">{errors.password}</p> : null}
        </div>
        <button className="button button--primary button--wide auth-submit" disabled={isSubmitting} type="submit">
          <span>{isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}</span>
          <ArrowIcon />
        </button>
        {registrationEnabled ? (
          <div className="auth-form__switch-link">
            <span aria-hidden="true" />
            <p className="auth-form__switch">¿Aún no tienes cuenta? <Link to="/register">Crear una cuenta</Link></p>
            <span aria-hidden="true" />
          </div>
        ) : null}
      </form>
    </AuthPageLayout>
  )
}

export function RegisterPage() {
  const { register } = useAuthentication()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateCredentials(email, password)
    if (!passwordConfirmation) {
      nextErrors.passwordConfirmation = 'Repite la contraseña.'
    } else if (password !== passwordConfirmation) {
      nextErrors.passwordConfirmation = 'Las contraseñas no coinciden.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const result = await register({ email: email.trim(), password })
    setIsSubmitting(false)
    if (!result.ok) setErrors({ form: errorMessages[result.error] })
  }

  return (
    <AuthPageLayout
      cardClassName="auth-card--register"
      description="Crea una cuenta para empezar a organizar y compartir partidas."
      eyebrow="Comunidad de juegos de mesa"
      title="Crea tu cuenta"
    >
      <form className="form-card auth-form auth-form--branded" noValidate onSubmit={handleSubmit}>
        {errors.form ? <div className="error-summary" role="alert"><p>{errors.form}</p></div> : null}
        <div className="field">
          <label className="field__label" htmlFor="register-email">Correo electrónico</label>
          <div className="auth-control">
            <span className="auth-control__leading-icon"><MailIcon /></span>
            <input
              aria-describedby={errors.email ? 'register-email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              id="register-email"
              onChange={(event) => { setEmail(event.target.value); setErrors({}) }}
              placeholder="tu@correo.com"
              type="email"
              value={email}
            />
          </div>
          {errors.email ? <p className="field__error" id="register-email-error">{errors.email}</p> : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="register-password">Contraseña</label>
          <div className="auth-control">
            <span className="auth-control__leading-icon"><LockIcon /></span>
            <input
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="new-password"
              id="register-password"
              minLength={6}
              onChange={(event) => { setPassword(event.target.value); setErrors({}) }}
              placeholder="Crea una contraseña"
              type="password"
              value={password}
            />
          </div>
          {errors.password ? <p className="field__error" id="register-password-error">{errors.password}</p> : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="register-password-confirmation">Repite la contraseña</label>
          <div className="auth-control">
            <span className="auth-control__leading-icon"><LockIcon /></span>
            <input
              aria-describedby={errors.passwordConfirmation ? 'register-password-confirmation-error' : undefined}
              aria-invalid={Boolean(errors.passwordConfirmation)}
              autoComplete="new-password"
              id="register-password-confirmation"
              minLength={6}
              onChange={(event) => { setPasswordConfirmation(event.target.value); setErrors({}) }}
              placeholder="Repite tu contraseña"
              type="password"
              value={passwordConfirmation}
            />
          </div>
          {errors.passwordConfirmation ? <p className="field__error" id="register-password-confirmation-error">{errors.passwordConfirmation}</p> : null}
        </div>
        <button className="button button--primary button--wide auth-submit" disabled={isSubmitting} type="submit">
          <span>{isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}</span>
          <ArrowIcon />
        </button>
        <div className="auth-form__switch-link">
          <span aria-hidden="true" />
          <p className="auth-form__switch">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
          <span aria-hidden="true" />
        </div>
      </form>
    </AuthPageLayout>
  )
}
