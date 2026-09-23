import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { madridZones } from '../../mock-data/prototypeData'
import {
  listingConditions,
  type GameListingInput,
  type ListingCondition,
  type ListingType,
} from '../domain/gameListing'
import type { GameListingCommandError } from '../application/gameListings'
import { useGameListings } from './GameListingsProvider'

type FormState = Readonly<{
  gameName: string
  imageFile: File | null
  description: string
  condition: ListingCondition
  listingType: ListingType
  priceEuros: string
  district: string
}>

type FormErrors = Partial<Record<keyof FormState, string>>

const conditionLabels: Record<ListingCondition, string> = {
  new: 'Precintado',
  likeNew: 'Como nuevo',
  good: 'Buen estado',
  used: 'Usado / con señales',
}

const initialForm: FormState = {
  gameName: '',
  imageFile: null,
  description: '',
  condition: 'good',
  listingType: 'sale',
  priceEuros: '',
  district: '',
}

const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'] as const

const validate = (form: FormState, requiresImage: boolean): FormErrors => {
  const errors: FormErrors = {}
  if (!form.gameName.trim()) errors.gameName = 'Indica el nombre del juego.'
  if (requiresImage && !form.imageFile) errors.imageFile = 'Selecciona una imagen representativa.'
  if (form.imageFile && !validImageTypes.includes(form.imageFile.type as (typeof validImageTypes)[number])) errors.imageFile = 'Usa una imagen JPEG, PNG o WebP.'
  if (form.imageFile && form.imageFile.size > 5 * 1024 * 1024) errors.imageFile = 'La imagen no puede superar 5 MB.'
  if (!form.description.trim()) errors.description = 'Añade una breve descripción del juego.'
  if (!form.district) errors.district = 'Selecciona una zona o distrito.'
  if (form.listingType === 'sale') {
    const amount = Number(form.priceEuros.replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0) errors.priceEuros = 'Indica un precio positivo en euros.'
  }
  return errors
}

const asInput = (form: FormState): Omit<GameListingInput, 'imageUrl'> => ({
  gameName: form.gameName,
  description: form.description,
  condition: form.condition,
  listingType: form.listingType,
  ...(form.listingType === 'sale' ? { priceInCents: Math.round(Number(form.priceEuros.replace(',', '.')) * 100) } : {}),
  city: 'Madrid',
  district: form.district,
})

const asImageUpload = async (file: File) => ({
  bytes: new Uint8Array(await file.arrayBuffer()),
  contentType: file.type as (typeof validImageTypes)[number],
})

const submissionErrorMessage = (error: GameListingCommandError) => {
  switch (error) {
    case 'image-upload-failed':
      return 'No hemos podido subir la imagen. Comprueba tu conexión e inténtalo de nuevo.'
    case 'image-url-failed':
      return 'La imagen se ha subido, pero no hemos podido prepararla para el anuncio. Inténtalo de nuevo.'
    case 'listing-persistence-failed':
      return 'No hemos podido publicar el anuncio. Inténtalo de nuevo.'
    case 'invalid-input':
      return 'Revisa los datos del anuncio e inténtalo de nuevo.'
    default:
      return 'Ha ocurrido un problema inesperado al publicar el anuncio. Inténtalo de nuevo.'
  }
}

export function ListingFormPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { createListing, ownListings, updateListing } = useGameListings()
  const editingListing = ownListings.find((listing) => listing.id === listingId)
  const isEditing = Boolean(listingId)
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!editingListing) return
    setForm({
      gameName: editingListing.gameName,
      imageFile: null,
      description: editingListing.description,
      condition: editingListing.condition,
      listingType: editingListing.listingType,
      priceEuros: editingListing.price ? String(editingListing.price.amountInCents / 100) : '',
      district: editingListing.district,
    })
  }, [editingListing])

  if (isEditing && (!editingListing || editingListing.status === 'closed')) {
    return <section className="page-container page-section"><div className="empty-state"><h1>No puedes editar este anuncio</h1><p>Solo puedes editar un anuncio activo que te pertenezca.</p><Link className="button button--primary" to="/">Volver a Explorar</Link></div></section>
  }

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(form, !isEditing)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      requestAnimationFrame(() => document.getElementById('listing-form-errors')?.focus())
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      const result = isEditing && editingListing
        ? await updateListing(editingListing.id, asInput(form), form.imageFile ? await asImageUpload(form.imageFile) : undefined)
        : await createListing(asInput(form), await asImageUpload(form.imageFile!))
      if (!result.ok) {
        setErrors({ imageFile: submissionErrorMessage(result.error) })
        return
      }
      navigate(`/listings/${result.value.id}`, { state: { [isEditing ? 'edited' : 'created']: true } })
    } catch {
      setErrors({ imageFile: 'No se ha podido procesar la imagen seleccionada. Inténtalo de nuevo.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-container form-page listing-form-page">
      <nav aria-label="Migas de pan" className="breadcrumb"><ol><li><Link to="/profile">Perfil</Link></li><li aria-current="page">{isEditing ? 'Editar anuncio' : 'Publicar un juego'}</li></ol></nav>
      <div className="page-heading">
        <p className="eyebrow">Juegos de la comunidad</p>
        <h1>{isEditing ? 'Editar anuncio' : 'Publicar un juego'}</h1>
        <p>Comparte la información esencial. Mesa Abierta no gestiona pagos, envíos ni reservas.</p>
      </div>
      <form className="form-card" noValidate onSubmit={(event) => void handleSubmit(event)}>
        <p className="required-note">Completa los campos identificados como obligatorios.</p>
        {Object.keys(errors).length > 0 ? <div className="error-summary" id="listing-form-errors" role="alert" tabIndex={-1}><strong>Revisa los campos indicados</strong><p>Hay información necesaria que falta o no es válida.</p></div> : null}
        <div className="form-grid">
          <div className="field form-field--wide">
            <label className="field__label" htmlFor="listing-game-name"><span>Juego</span><span className="field__requirement">Obligatorio</span></label>
            <input aria-describedby={errors.gameName ? 'listing-game-name-error' : undefined} aria-invalid={Boolean(errors.gameName)} id="listing-game-name" maxLength={120} onChange={(event) => update('gameName', event.target.value)} required value={form.gameName} />
            {errors.gameName ? <p className="field__error" id="listing-game-name-error">{errors.gameName}</p> : null}
          </div>
          <div className="field form-field--wide">
            <label className="field__label" htmlFor="listing-image"><span>Imagen representativa</span><span className="field__requirement">Obligatorio</span></label>
            <input accept="image/jpeg,image/png,image/webp" aria-describedby={`listing-image-help${errors.imageFile ? ' listing-image-error' : ''}`} aria-invalid={Boolean(errors.imageFile)} id="listing-image" onChange={(event) => update('imageFile', event.target.files?.[0] ?? null)} required={!isEditing} type="file" />
            <p className="field__help" id="listing-image-help">JPEG, PNG o WebP, hasta 5 MB.{isEditing ? ' Si no eliges otra imagen, se conservará la actual.' : ''}</p>
            {form.imageFile ? <p className="field__help">Archivo seleccionado: {form.imageFile.name}</p> : null}
            {errors.imageFile ? <p className="field__error" id="listing-image-error">{errors.imageFile}</p> : null}
          </div>
          <div className="field form-field--wide">
            <label className="field__label" htmlFor="listing-description"><span>Descripción</span><span className="field__requirement">Obligatorio</span></label>
            <textarea aria-describedby={errors.description ? 'listing-description-error' : undefined} aria-invalid={Boolean(errors.description)} id="listing-description" maxLength={500} onChange={(event) => update('description', event.target.value)} required rows={4} value={form.description} />
            {errors.description ? <p className="field__error" id="listing-description-error">{errors.description}</p> : null}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="listing-condition"><span>Condición</span><span className="field__requirement">Obligatorio</span></label>
            <div className="select-wrap"><select id="listing-condition" onChange={(event) => update('condition', event.target.value as ListingCondition)} value={form.condition}>{listingConditions.map((condition) => <option key={condition} value={condition}>{conditionLabels[condition]}</option>)}</select></div>
          </div>
          <fieldset className="field listing-type-field"><legend className="field__label"><span>Modalidad</span><span className="field__requirement">Obligatorio</span></legend><div className="listing-type-options"><label><input checked={form.listingType === 'sale'} name="listing-type" onChange={() => update('listingType', 'sale')} type="radio" value="sale" /> Venta</label><label><input checked={form.listingType === 'trade'} name="listing-type" onChange={() => update('listingType', 'trade')} type="radio" value="trade" /> Intercambio</label></div></fieldset>
          {form.listingType === 'sale' ? <div className="field">
            <label className="field__label" htmlFor="listing-price"><span>Precio en euros</span><span className="field__requirement">Obligatorio</span></label>
            <input aria-describedby={errors.priceEuros ? 'listing-price-error' : undefined} aria-invalid={Boolean(errors.priceEuros)} id="listing-price" inputMode="decimal" min="0.01" onChange={(event) => update('priceEuros', event.target.value)} required step="0.01" type="number" value={form.priceEuros} />
            {errors.priceEuros ? <p className="field__error" id="listing-price-error">{errors.priceEuros}</p> : null}
          </div> : <p className="field__help listing-trade-help">Explica en la descripción qué intercambio te interesa. No se asigna precio.</p>}
          <div className="fixed-field" role="group" aria-labelledby="listing-city-label"><span id="listing-city-label">Ciudad</span><strong>Madrid</strong><small>Contexto actual del prototipo</small></div>
          <div className="field">
            <label className="field__label" htmlFor="listing-district"><span>Zona o distrito</span><span className="field__requirement">Obligatorio</span></label>
            <div className="select-wrap"><select aria-describedby={errors.district ? 'listing-district-error' : undefined} aria-invalid={Boolean(errors.district)} id="listing-district" onChange={(event) => update('district', event.target.value)} required value={form.district}><option value="">Selecciona una zona</option>{madridZones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></div>
            {errors.district ? <p className="field__error" id="listing-district-error">{errors.district}</p> : null}
          </div>
        </div>
        <div className="form-actions"><button className="button button--primary form-submit" disabled={submitting} type="submit">{submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Publicar anuncio'}</button></div>
      </form>
    </section>
  )
}
