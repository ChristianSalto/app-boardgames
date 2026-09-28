export type SessionObservationError = 'permission-denied' | 'unavailable' | 'unexpected'

export type SessionObserver<Value> = Readonly<{
  next: (value: Value) => void
  error: (reason: SessionObservationError) => void
}>

export type Unsubscribe = () => void
