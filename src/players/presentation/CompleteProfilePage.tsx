import { useState, type FormEvent } from 'react'
import { madridZones } from '../../mock-data/prototypeData'
import { useCurrentPlayer } from './CurrentPlayerProvider'

type FormErrors = {
  displayName?: string
  form?: string
}

export function CompleteProfilePage() {
  const { createCurrentPlayer } = useCurrentPlayer()
  const [displayName, setDisplayName] = useState('')
  const [district, setDistrict] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!displayName.trim()) {
      setErrors({ displayName: 'Escribe el nombre que verán otras personas.' })
      return
    }

    setErrors({})
    setIsSubmitting(true)
    const created = await createCurrentPlayer({
      displayName: displayName.trim(),
      ...(district ? { district } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
    })
    setIsSubmitting(false)
    if (!created) {
      setErrors({ form: 'No hemos podido guardar tu perfil. Comprueba los emuladores e inténtalo de nuevo.' })
    }
  }

  return (
    <main className="auth-page page-container">
      <section className="auth-card" aria-labelledby="complete-profile-title">
        <div className="auth-card__heading">
          <p className="eyebrow">Tu perfil en Mesa Abierta</p>
          <h1 id="complete-profile-title">Completa tu perfil</h1>
          <p>Usaremos estos datos para identificarte cuando organices o participes en una partida.</p>
        </div>
        <form className="form-card auth-form" noValidate onSubmit={handleSubmit}>
          {errors.form ? <div className="error-summary" role="alert"><p>{errors.form}</p></div> : null}
          <div className="field">
            <label className="field__label" htmlFor="display-name">Nombre visible</label>
            <input
              aria-describedby={errors.displayName ? 'display-name-error' : undefined}
              aria-invalid={Boolean(errors.displayName)}
              autoComplete="nickname"
              id="display-name"
              maxLength={60}
              onChange={(event) => { setDisplayName(event.target.value); setErrors({}) }}
              value={displayName}
            />
            {errors.displayName ? <p className="field__error" id="display-name-error">{errors.displayName}</p> : null}
          </div>
          <div className="fixed-field">
            <span>Ciudad</span><strong>Madrid</strong><small>Contexto inicial del producto</small>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="district">Zona o distrito <span>(opcional)</span></label>
            <select id="district" onChange={(event) => setDistrict(event.target.value)} value={district}>
              <option value="">Prefiero no indicarla</option>
              {madridZones.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="profile-description">Descripción <span>(opcional)</span></label>
            <textarea
              id="profile-description"
              maxLength={240}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              value={description}
            />
          </div>
          <button className="button button--primary button--wide" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Guardando perfil…' : 'Entrar en Mesa Abierta'}
          </button>
        </form>
      </section>
    </main>
  )
}
