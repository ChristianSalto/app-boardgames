import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { gameOptions, madridZones } from '../mock-data/prototypeData'
import { VisualSelect } from '../shared/VisualSelect'
import type { CreateSessionInput } from './types'

type FormErrors = Partial<Record<keyof CreateSessionInput, string>>

const tomorrow = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const initialForm: CreateSessionInput = {
  game: '',
  date: tomorrow(),
  time: '19:00',
  zone: '',
  place: '',
  capacity: 4,
  description: '',
}

const validate = (form: CreateSessionInput): FormErrors => {
  const errors: FormErrors = {}
  if (!form.game) errors.game = 'Selecciona el juego de la partida.'
  if (!form.date) errors.date = 'Indica la fecha de la partida.'
  if (!form.time) errors.time = 'Indica la hora de la partida.'
  if (form.date && form.time && new Date(`${form.date}T${form.time}:00`).getTime() <= Date.now()) {
    errors.date = 'La fecha y la hora deben estar en el futuro.'
  }
  if (!form.zone) errors.zone = 'Selecciona una zona o distrito.'
  if (!Number.isInteger(form.capacity) || form.capacity < 2) {
    errors.capacity = 'El aforo debe permitir al menos al organizador y otra persona.'
  }
  return errors
}

export function CreateSessionPage() {
  const { createSession } = usePrototype()
  const navigate = useNavigate()
  const [form, setForm] = useState<CreateSessionInput>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})

  const update = <Key extends keyof CreateSessionInput>(
    key: Key,
    value: CreateSessionInput[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors[key]
      return nextErrors
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      requestAnimationFrame(() => document.getElementById('form-errors')?.focus())
      return
    }

    const sessionId = createSession(form)
    navigate(`/sessions/${sessionId}`, {
      state: { created: true, from: '/my-sessions', fromLabel: 'Mis partidas' },
    })
  }

  return (
    <section className="page-container form-page">
      <div className="page-heading">
        <p className="eyebrow">Abre una mesa</p>
        <h1>Crear partida</h1>
        <p>Lo esencial para que otras personas sepan si esta partida les encaja.</p>
      </div>

      <form className="form-card" noValidate onSubmit={handleSubmit}>
        <p className="required-note">Completa los campos identificados como obligatorios.</p>

        {Object.keys(errors).length > 0 ? (
          <div className="error-summary" id="form-errors" role="alert" tabIndex={-1}>
            <strong>Revisa los campos indicados</strong>
            <p>Hay información necesaria que falta o no es válida.</p>
          </div>
        ) : null}

        <div className="form-grid">
          <div className="field form-field--wide">
            <label className="field__label" htmlFor="game">
              <span>Juego</span><span className="field__requirement">Obligatorio</span>
            </label>
            <div className="select-wrap">
              <select
                aria-describedby={errors.game ? 'game-error' : undefined}
                aria-invalid={Boolean(errors.game)}
                id="game"
                onChange={(event) => update('game', event.target.value)}
                required
                value={form.game}
              >
                <option value="">Selecciona un juego</option>
                {gameOptions.map((game) => <option key={game}>{game}</option>)}
              </select>
            </div>
            {errors.game ? <p className="field__error" id="game-error">{errors.game}</p> : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="date">
              <span>Fecha</span><span className="field__requirement">Obligatorio</span>
            </label>
            <input
              aria-describedby={errors.date ? 'date-error' : undefined}
              aria-invalid={Boolean(errors.date)}
              id="date"
              min={tomorrow()}
              onChange={(event) => update('date', event.target.value)}
              required
              type="date"
              value={form.date}
            />
            {errors.date ? <p className="field__error" id="date-error">{errors.date}</p> : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="time">
              <span>Hora</span><span className="field__requirement">Obligatorio</span>
            </label>
            <input
              aria-describedby={errors.time ? 'time-error' : undefined}
              aria-invalid={Boolean(errors.time)}
              id="time"
              onChange={(event) => update('time', event.target.value)}
              required
              type="time"
              value={form.time}
            />
            {errors.time ? <p className="field__error" id="time-error">{errors.time}</p> : null}
          </div>

          <div className="fixed-field" role="group" aria-labelledby="city-label" aria-describedby="city-help">
            <span id="city-label">Ciudad</span>
            <strong>Madrid</strong>
            <small id="city-help">Contexto fijo del prototipo</small>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="zone" id="zone-label">
              <span>Zona o distrito</span><span className="field__requirement">Obligatorio</span>
            </label>
            <VisualSelect
              ariaDescribedBy={errors.zone ? 'zone-error' : undefined}
              ariaInvalid={Boolean(errors.zone)}
              ariaLabelledBy="zone-label"
              id="zone"
              onChange={(value) => update('zone', value)}
              options={[
                { value: '', label: 'Selecciona una zona' },
                ...madridZones.map((zone) => ({ value: zone, label: zone })),
              ]}
              required
              value={form.zone}
            />
            {errors.zone ? <p className="field__error" id="zone-error">{errors.zone}</p> : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="place">
              <span>Lugar de la partida</span><span className="field__requirement">Opcional</span>
            </label>
            <input
              aria-describedby="place-help"
              id="place"
              maxLength={80}
              onChange={(event) => update('place', event.target.value)}
              placeholder="Ej. Café Manuela"
              type="text"
              value={form.place}
            />
            <p className="field__help" id="place-help">
              Nombre del local o punto reconocible; no hace falta una dirección postal.
            </p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="capacity">
              <span>Aforo total</span><span className="field__requirement">Obligatorio</span>
            </label>
            <input
              aria-describedby={`capacity-help${errors.capacity ? ' capacity-error' : ''}`}
              aria-invalid={Boolean(errors.capacity)}
              id="capacity"
              min="2"
              onChange={(event) => update('capacity', Number(event.target.value))}
              required
              type="number"
              value={form.capacity}
            />
            <p className="field__help" id="capacity-help">
              Tú ocupas una plaza. Quedarán {Math.max(0, form.capacity - 1)} para otras personas.
            </p>
            {errors.capacity ? <p className="field__error" id="capacity-error">{errors.capacity}</p> : null}
          </div>

          <div className="field form-field--wide">
            <label className="field__label" htmlFor="description">
              <span>Descripción</span><span className="field__requirement">Opcional</span>
            </label>
            <textarea
              aria-describedby="description-help"
              id="description"
              maxLength={320}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Nivel, duración aproximada o cualquier detalle útil."
              rows={4}
              value={form.description}
            />
            <p className="field__help field__help--counter" id="description-help">
              {form.description.length}/320 caracteres
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button className="button button--primary form-submit" type="submit">
            Publicar partida
          </button>
        </div>
      </form>
    </section>
  )
}
