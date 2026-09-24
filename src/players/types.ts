export type Player = {
  readonly id: string
  readonly displayName: string
  readonly city: string
  readonly district?: string
  readonly description?: string
  readonly avatarUrl?: string
}

export type CreatePlayerInput = {
  readonly id: string
  readonly displayName: string
  readonly city: 'Madrid'
  readonly district?: string
  readonly description?: string
}
