import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteEquipo, listEquipos } from '../api/sgff'
import { useFederacion } from '../context/FederacionContext'
import type { Equipo } from '../types/api'
import { ApiError } from '../api/client'

export function EquiposPage() {
  const { federacion } = useFederacion()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!federacion) return
    setLoading(true)
    setError(null)
    try {
      const data = await listEquipos({
        id_federacion: federacion.id_federacion,
        q: q.trim() || undefined,
        con_inactivos: false,
        per_page: 200,
      })
      setRows(data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los equipos.')
    } finally {
      setLoading(false)
    }
  }, [federacion, q])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load()
    }, 300)
    return () => window.clearTimeout(t)
  }, [load])

  async function onDelete(id: number, nombre: string) {
    if (!window.confirm(`¿Inactivar el equipo «${nombre}»? Esta acción puede afectar jugadores en cascada según el backend.`)) return
    try {
      await deleteEquipo(id)
      await load()
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : 'No se pudo eliminar.')
    }
  }

  return (
    <div className="page page--equipos">
      <div className="toolbar">
        <Link to="/app/equipos/nuevo" className="btn btn--light btn--pill toolbar__new">
          <span aria-hidden>＋</span> Crear nuevo
        </Link>
        <div className="search-field">
          <span className="search-field__icon" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="search-field__input"
            placeholder="Buscar equipo"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar equipo"
          />
        </div>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <p className="muted">Cargando…</p> : null}

      <ul className="team-list" aria-busy={loading}>
        {!loading && rows.length === 0 ? (
          <li className="team-list__empty muted">No hay equipos que coincidan con la búsqueda.</li>
        ) : null}
        {rows.map((eq) => (
          <li key={eq.id_equipo} className="team-row">
            <span className="team-row__name">{eq.nombre}</span>
            <div className="team-row__actions">
              <button
                type="button"
                className="icon-btn"
                aria-label={`Editar ${eq.nombre}`}
                onClick={() => navigate(`/app/equipos/${eq.id_equipo}/editar`)}
              >
                ✎
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                aria-label={`Eliminar ${eq.nombre}`}
                onClick={() => void onDelete(eq.id_equipo, eq.nombre)}
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
