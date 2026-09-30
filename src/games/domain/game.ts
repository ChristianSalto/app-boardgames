export type GameId = string

export type Game = Readonly<{
  id: GameId
  name: string
  aliases?: readonly string[]
}>

export const isValidGameId = (value: string) => /^[a-z0-9][a-z0-9-]{0,63}$/.test(value)
export const isValidGameName = (value: string) => value.trim().length > 0 && value.length <= 120
