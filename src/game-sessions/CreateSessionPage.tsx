import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrototype } from '../app/PrototypeContext'
import { gameOptions, madridZones } from '../mock-data/prototypeData'
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
    setErrors((current) => ({ ...current, [key]: undefined }))
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
    navigate(`/sessions/${sessionId}`, { state: { created: true } })
  }

  return (
    <section className="page-container form-page">
      <div className="page-heading">
        <p className="eyebrow">Abre una mesa</p>
        <h1>Crear partida</h1>
        <p>Lo esencial para que otras personas sepan si esta partida les encaja.</p>
      </div>

      <form className="form-card" noValidate onSubmit={handleSubmit}>
        <p className="required-note">Los campos marcados con * son obligatorios.</p>

        {Object.keys(errors).length > 0 ? (
          <div className="error-summary" id="form-errors" role="alert" tabIndex={-1}>
            <strong>Revisa los campos indicados</strong>
            <p>Hay información necesaria que falta o no es válida.</p>
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="game">Juego *</label>
          <select
            aria-describedby={errors.game ? 'game-error' : undefined}
            aria-invalid={Boolean(errors.game)}
            id="game"
            onChange={(event) => update('game', event.target.value)}
            value={form.game}
          >
            <option value="">Selecciona un juego</option>
            {gameOptions.map((game) => <option key={game}>{game}</option>)}
          </select>
          {errors.game ? <p className="field__error" id="game-error">{errors.game}</p> : null}
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="date">Fecha *</label>
            <input
              aria-describedby={errors.date ? 'date-error' : undefined}
              aria-invalid={Boolean(errors.date)}
              id="date"
              min={tomorrow()}
              onChange={(event) => update('date', event.target.value)}
              type="date"
              value={form.date}
            />
            {errors.date ? <p className="field__error" id="date-error">{errors.date}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="time">Hora *</label>
            <input
              aria-describedby={errors.time ? 'time-error' : undefined}
              aria-invalid={Boolean(errors.time)}
              id="time"
              onChange={(event) => update('time', event.target.value)}
              type="time"
              value={form.time}
            />
            {errors.time ? <p className="field__error" id="time-error">{errors.time}</p> : null}
          </div>
        </div>

        <div className="fixed-field" aria-label="Ciudad: Madrid, contexto fijo del prototipo">
          <span>Ciudad</span>
          <strong>Madrid</strong>
          <small>Contexto fijo del prototipo</small>
        </div>

        <div className="field">
          <label htmlFor="zone">Zona o distrito *</label>
          <select
            aria-describedby={errors.zone ? 'zone-error' : undefined}
            aria-invalid={Boolean(errors.zone)}
            id="zone"
            onChange={(event) => update('zone', event.target.value)}
            value={form.zone}
          >
            <option value="">Selecciona una zona</option>
            {madridZones.map((zone) => <option key={zone}>{zone}</option>)}
          </select>
          {errors.zone ? <p className="field__error" id="zone-error">{errors.zone}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="capacity">Aforo total *</label>
          <input
            aria-describedby={`capacity-help${errors.capacity ? ' capacity-error' : ''}`}
            aria-invalid={Boolean(errors.capacity)}
            id="capacity"
            min="2"
            onChange={(event) => update('capacity', Number(event.target.value))}
            type="number"
            value={form.capacity}
          />
          <p className="field__help" id="capacity-help">
            Tú cuentas dentro del aforo. Quedarán {Math.max(0, form.capacity - 1)} plazas disponibles.
          </p>
          {errors.capacity ? <p className="field__error" id="capacity-error">{errors.capacity}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="description">Descripción <span>(opcional)</span></label>
          <textarea
            id="description"
            maxLength={320}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Nivel de la partida, duración aproximada o cualquier detalle útil."
            rows={4}
            value={form.description}
          />
          <p className="field__help">{form.description.length}/320 caracteres</p>
        </div>

        <button className="button button--primary button--wide" type="submit">
          Publicar partida
        </button>
      </form>
    </section>
  )
}
