type IconName =
  | 'explore'
  | 'sessions'
  | 'create'
  | 'profile'
  | 'calendar'
  | 'location'
  | 'people'
  | 'arrow'

type AppIconProps = {
  readonly name: IconName
  readonly size?: number
}

const paths: Record<IconName, React.ReactNode> = {
  explore: <><circle cx="12" cy="12" r="8" /><path d="m14.8 9.2-2 5.6-5.6 2 2-5.6 5.6-2Z" /></>,
  sessions: <><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M8 3.5v4M16 3.5v4M4 10h16" /></>,
  create: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></>,
  profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
  people: <><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M14 16a4.5 4.5 0 0 1 6.5 4" /></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
}

export function AppIcon({ name, size = 20 }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="app-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  )
}
