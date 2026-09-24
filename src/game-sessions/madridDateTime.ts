const madridTimeZone = 'Europe/Madrid'

type MadridCivilDateTime = Readonly<{
  date: string
  time: string
}>

export type MadridInstantResult =
  | Readonly<{ ok: true; instant: string; disambiguation: 'exact' | 'earlier' }>
  | Readonly<{ ok: false; reason: 'invalid-civil-time' | 'nonexistent-civil-time' }>

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: madridTimeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const pad = (value: number) => String(value).padStart(2, '0')

const partsFor = (instant: Date) => {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(instant)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  )
  return {
    year: parts.year ?? 0,
    month: parts.month ?? 0,
    day: parts.day ?? 0,
    hour: parts.hour ?? 0,
    minute: parts.minute ?? 0,
    second: parts.second ?? 0,
  }
}

const parseCivilDateTime = (date: string, time: string) => {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time)
  if (!dateMatch || !timeMatch) return null

  const values = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  }
  const verification = new Date(Date.UTC(values.year, values.month - 1, values.day))
  if (
    values.hour > 23
    || values.minute > 59
    || verification.getUTCFullYear() !== values.year
    || verification.getUTCMonth() + 1 !== values.month
    || verification.getUTCDate() !== values.day
  ) return null

  return values
}

const offsetAt = (timestamp: number) => {
  const date = new Date(timestamp)
  const parts = partsFor(date)
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  return representedAsUtc - date.getTime()
}

const isSameCivilTime = (
  instant: Date,
  civil: NonNullable<ReturnType<typeof parseCivilDateTime>>,
) => {
  const parts = partsFor(instant)
  return parts.year === civil.year
    && parts.month === civil.month
    && parts.day === civil.day
    && parts.hour === civil.hour
    && parts.minute === civil.minute
}

export const madridCivilToInstant = (date: string, time: string): MadridInstantResult => {
  const civil = parseCivilDateTime(date, time)
  if (!civil) return { ok: false, reason: 'invalid-civil-time' }

  const civilAsUtc = Date.UTC(
    civil.year,
    civil.month - 1,
    civil.day,
    civil.hour,
    civil.minute,
  )
  const offsets = new Set([
    offsetAt(civilAsUtc - 36 * 60 * 60 * 1000),
    offsetAt(civilAsUtc),
    offsetAt(civilAsUtc + 36 * 60 * 60 * 1000),
  ])
  const candidates = [...offsets]
    .map((offset) => new Date(civilAsUtc - offset))
    .filter((candidate) => isSameCivilTime(candidate, civil))
    .sort((first, second) => first.getTime() - second.getTime())

  if (candidates.length === 0) return { ok: false, reason: 'nonexistent-civil-time' }
  return {
    ok: true,
    instant: candidates[0]!.toISOString(),
    disambiguation: candidates.length > 1 ? 'earlier' : 'exact',
  }
}

export const instantToMadridCivil = (instant: string | Date): MadridCivilDateTime => {
  const parts = partsFor(typeof instant === 'string' ? new Date(instant) : instant)
  return {
    date: `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`,
    time: `${pad(parts.hour)}:${pad(parts.minute)}`,
  }
}

export const madridTimeZoneName = madridTimeZone
