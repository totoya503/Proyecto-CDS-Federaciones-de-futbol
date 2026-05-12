import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEquipos } from '../api/sgff'
import { useFederacion } from '../context/FederacionContext'

export function InicioPage() {
  const { federacion } = useFederacion()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!federacion) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const rows = await listEquipos({
          id_federacion: federacion.id_federacion,
          con_inactivos: false,
          per_page: 200,
        })
        if (!cancelled) setCount(rows.length)
      } catch {
        if (!cancelled) setCount(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [federacion])

  const empty = !loading && count === 0

  return (
    <div className="page page--inicio">
      <h1 className="page-title">Bienvenido/a</h1>

      {empty ? (
        <div className="banner banner--warn" role="status">
          Parece que aún no tienes ningún equipo registrado,{' '}
          <Link to="/app/equipos/nuevo" className="banner__link">
            registra tu primer equipo
          </Link>
        </div>
      ) : null}

      <div className="home-cards">
        <Link to="/app/equipos" className="home-card">
          <span className="home-card__icon" aria-hidden>
            🏆
          </span>
          <span className="home-card__label">Gestión de equipos</span>
        </Link>
        <Link to="/app/reportes" className="home-card">
          <span className="home-card__icon" aria-hidden>
            📊
          </span>
          <span className="home-card__label">Reportes</span>
        </Link>
      </div>

      {loading ? <p className="muted">Cargando resumen…</p> : null}
      {!loading && count !== null && count > 0 ? (
        <p className="muted">Tienes {count} equipo{count === 1 ? '' : 's'} registrado{count === 1 ? '' : 's'}.</p>
      ) : null}
    </div>
  )
}
