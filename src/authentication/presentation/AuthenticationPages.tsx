import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
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

function AuthenticationLayout({
  children,
  title,
  description,
}: {
  readonly children: ReactNode
  readonly title: string
  readonly description: string
}) {
  return (
    <main className="auth-page page-container">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="brand auth-card__brand" to="/login" aria-label="Mesa Abierta">
          <span className="brand__mark" aria-hidden="true">MA</span>
          <span className="brand__name">Mesa Abierta</span>
          <span className="brand__tag">Prototipo</span>
        </Link>
        <div className="auth-card__heading">
          <p className="eyebrow">Comunidad de juegos de mesa</p>
          <h1 id="auth-title">{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </section>
    </main>
  )
}

export function LoginPage() {
  const { login } = useAuthentication()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <AuthenticationLayout
      description="Inicia sesión para organizar partidas y solicitar plaza en Mesa Abierta."
      title="Bienvenido de nuevo"
    >
      <form className="form-card auth-form" noValidate onSubmit={handleSubmit}>
        {errors.form ? <div className="error-summary" role="alert"><p>{errors.form}</p></div> : null}
        <div className="field">
          <label className="field__label" htmlFor="login-email">Correo electrónico</label>
          <input
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            id="login-email"
            onChange={(event) => { setEmail(event.target.value); setErrors({}) }}
            type="email"
            value={email}
          />
          {errors.email ? <p className="field__error" id="login-email-error">{errors.email}</p> : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="login-password">Contraseña</label>
          <input
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete="current-password"
            id="login-password"
            onChange={(event) => { setPassword(event.target.value); setErrors({}) }}
            type="password"
            value={password}
          />
          {errors.password ? <p className="field__error" id="login-password-error">{errors.password}</p> : null}
        </div>
        <button className="button button--primary button--wide" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
        <p className="auth-form__switch">¿Aún no tienes cuenta? <Link to="/register">Crear una cuenta</Link></p>
      </form>
    </AuthenticationLayout>
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
    <AuthenticationLayout
      description="Crea una cuenta para empezar a organizar y compartir partidas."
      title="Crea tu cuenta"
    >
      <form className="form-card auth-form" noValidate onSubmit={handleSubmit}>
        {errors.form ? <div className="error-summary" role="alert"><p>{errors.form}</p></div> : null}
        <div className="field">
          <label className="field__label" htmlFor="register-email">Correo electrónico</label>
          <input
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            id="register-email"
            onChange={(event) => { setEmail(event.target.value); setErrors({}) }}
            type="email"
            value={email}
          />
          {errors.email ? <p className="field__error" id="register-email-error">{errors.email}</p> : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="register-password">Contraseña</label>
          <input
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete="new-password"
            id="register-password"
            minLength={6}
            onChange={(event) => { setPassword(event.target.value); setErrors({}) }}
            type="password"
            value={password}
          />
          {errors.password ? <p className="field__error" id="register-password-error">{errors.password}</p> : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="register-password-confirmation">Repite la contraseña</label>
          <input
            aria-describedby={errors.passwordConfirmation ? 'register-password-confirmation-error' : undefined}
            aria-invalid={Boolean(errors.passwordConfirmation)}
            autoComplete="new-password"
            id="register-password-confirmation"
            minLength={6}
            onChange={(event) => { setPasswordConfirmation(event.target.value); setErrors({}) }}
            type="password"
            value={passwordConfirmation}
          />
          {errors.passwordConfirmation ? <p className="field__error" id="register-password-confirmation-error">{errors.passwordConfirmation}</p> : null}
        </div>
        <button className="button button--primary button--wide" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        <p className="auth-form__switch">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
      </form>
    </AuthenticationLayout>
  )
}
