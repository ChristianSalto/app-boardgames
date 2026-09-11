import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthPageLayoutProps = {
  readonly children: ReactNode
  readonly description: string
  readonly eyebrow: string
  readonly title: string
  readonly brandHref?: string | null
  readonly cardClassName?: string
}

function AuthBrand({ brandHref }: { readonly brandHref?: string | null }) {
  const content = (
    <>
      <span className="brand__mark" aria-hidden="true">MA</span>
      <span className="brand__name">Mesa Abierta</span>
      <span className="brand__tag">Prototipo</span>
      <span className="auth-brand-ornament" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </>
  )

  return brandHref ? (
    <Link className="brand auth-card__brand" to={brandHref} aria-label="Mesa Abierta">
      {content}
    </Link>
  ) : <div className="brand auth-card__brand">{content}</div>
}

function AuthCardFooter() {
  return (
    <footer className="auth-card__footer" aria-hidden="true">
      <div className="auth-card__footer-mark">
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="8" r="5" />
          <path d="m14 15-8 5 3 7 7-3-2 11h12l-2-11 7 3 3-7-8-5c-2-1-4-2-6-2s-4 1-6 2Z" />
        </svg>
      </div>
      <p><span />Buenas partidas, mejores personas<span /></p>
    </footer>
  )
}

export function AuthPageLayout({
  children,
  description,
  eyebrow,
  title,
  brandHref = '/login',
  cardClassName = '',
}: AuthPageLayoutProps) {
  return (
    <main className="auth-page page-container auth-page--branded">
      <section className={`auth-card auth-card--branded${cardClassName ? ` ${cardClassName}` : ''}`} aria-labelledby="auth-page-title">
        <AuthBrand brandHref={brandHref} />
        <div className="auth-card__heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="auth-page-title">{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <AuthCardFooter />
      </section>
    </main>
  )
}
