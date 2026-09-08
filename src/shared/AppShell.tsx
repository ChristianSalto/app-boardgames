import { useEffect, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AppIcon } from './AppIcon'

const navigation = [
  { to: '/', label: 'Explorar', icon: 'explore', end: true },
  { to: '/my-sessions', label: 'Mis partidas', icon: 'sessions', end: false },
  { to: '/create', label: 'Crear', icon: 'create', end: false },
  { to: '/profile', label: 'Perfil', icon: 'profile', end: false },
] as const

function PrimaryNavigation({ mobile = false }: { readonly mobile?: boolean }) {
  return (
    <nav
      aria-label="Navegación principal"
      className={mobile ? 'primary-nav primary-nav--mobile' : 'primary-nav'}
    >
      {navigation.map((item) => (
        <NavLink
          className={({ isActive }) =>
            `primary-nav__link${isActive ? ' is-active' : ''}${item.label === 'Crear' ? ' primary-nav__link--create' : ''}`
          }
          end={item.end}
          key={item.to}
          to={item.to}
        >
          <AppIcon name={item.icon} size={mobile ? 22 : 18} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell({ children }: { readonly children: ReactNode }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/" aria-label="Mesa Abierta, ir a Explorar">
            <span className="brand__mark" aria-hidden="true">MA</span>
            <span className="brand__name">Mesa Abierta</span>
            <span className="brand__tag">Prototipo</span>
          </Link>
          <PrimaryNavigation />
        </div>
      </header>
      <main id="main-content">{children}</main>
      <PrimaryNavigation mobile />
    </div>
  )
}
