import { usePlayerTrustSummary } from './PlayerTrustProvider'

export function PlayerTrustCompact({ playerId }: { readonly playerId: string }) {
  const summary = usePlayerTrustSummary(playerId)

  return (
    <dl className="organizer-trust__signals" aria-live="polite">
      <div>
        <dt>Reputación</dt>
        <dd>{!summary ? 'Cargando…' : summary.state === 'new'
          ? 'Nuevo en Mesa Abierta · Sin valoraciones todavía'
          : `${summary.averageRating?.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ★ · ${summary.reviewCount} ${summary.reviewCount === 1 ? 'valoración' : 'valoraciones'}`}</dd>
      </div>
      <div>
        <dt>Fiabilidad</dt>
        <dd>Sin datos de asistencia verificados</dd>
      </div>
    </dl>
  )
}
