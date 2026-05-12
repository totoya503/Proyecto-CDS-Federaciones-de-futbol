import { Link, NavLink } from 'react-router-dom'
import { LogoBall } from './LogoBall'

type HeaderVariant = 'marketing' | 'app'

export function AppHeader({
  variant,
  federationName,
}: {
  variant: HeaderVariant
  federationName?: string
}) {
  if (variant === 'marketing') {
    return (
      <header className="sgff-header sgff-header--marketing">
        <div className="sgff-header__brand">
          <LogoBall size={44} />
          <span className="sgff-header__title">SGFF</span>
        </div>
      </header>
    )
  }

  return (
    <header className="sgff-header sgff-header--app">
      <div className="sgff-header__left">
        <Link to="/app/inicio" className="sgff-header__brand">
          <LogoBall size={40} />
        </Link>
        <nav className="sgff-nav" aria-label="Principal">
          <NavLink to="/app/inicio" className={({ isActive }) => (isActive ? 'is-active' : '')} end>
            Inicio
          </NavLink>
          <NavLink to="/app/equipos" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Equipos
          </NavLink>
          <NavLink to="/app/reportes" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Reportes
          </NavLink>
        </nav>
      </div>
      <div className="sgff-header__right">
        <span className="sgff-header__fed">{federationName ?? 'Federación'}</span>
        <LogoBall size={36} />
      </div>
    </header>
  )
}
