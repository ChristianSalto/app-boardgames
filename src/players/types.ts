export type Player = {
  readonly id: string
  readonly name: string
  readonly city: string
  readonly zone?: string
  readonly description?: string
}

export type PlayerProfileInput = {
  readonly name: string
  readonly zone: string
  readonly description: string
}
