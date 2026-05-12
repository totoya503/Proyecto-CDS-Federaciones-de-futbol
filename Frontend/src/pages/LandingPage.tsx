import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'

export function LandingPage() {
  return (
    <div className="page page--landing">
      <AppHeader variant="marketing" />
      <div className="landing-body">
        <div className="landing-pill landing-pill--title">Sistema de gestión de Federación</div>
        <Link to="/registro-federacion" className="btn btn--primary btn--pill landing-cta">
          Iniciar
        </Link>
      </div>
    </div>
  )
}
