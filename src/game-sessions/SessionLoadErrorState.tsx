type SessionLoadErrorStateProps = {
  readonly title: string
  readonly message: string
  readonly loading: boolean
  readonly onRetry: () => void
}

export function SessionLoadErrorState({ title, message, loading, onRetry }: SessionLoadErrorStateProps) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p role="alert">{message}</p>
      <p aria-live="polite" className="field__help">{loading ? 'Reintentando la carga…' : ''}</p>
      <button
        aria-disabled={loading}
        className="button button--primary"
        onClick={() => { if (!loading) onRetry() }}
        type="button"
      >
        {loading ? 'Reintentando…' : 'Reintentar'}
      </button>
    </div>
  )
}
