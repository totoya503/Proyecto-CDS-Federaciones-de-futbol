import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useFederacion } from '../context/FederacionContext'
import { AppHeader } from '../components/AppHeader'

export function AppShell() {
  const { federacion } = useFederacion()
  const location = useLocation()

  if (!federacion) {
    return <Navigate to="/registro-federacion" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="app-shell">
      <AppHeader variant="app" federationName={federacion.nombre} />
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  )
}
