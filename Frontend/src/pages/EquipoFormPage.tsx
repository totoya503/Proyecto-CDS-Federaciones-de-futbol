import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createEquipoUnderFederacion,
  createJugador,
  deleteJugador,
  getEquipo,
  updateEquipo,
  updateJugador,
} from '../api/sgff'
import { ApiError } from '../api/client'
import { useFederacion } from '../context/FederacionContext'
import { GENERO_OPTIONS, isFutureIsoDate } from '../lib/dates'
import type { Jugador } from '../types/api'

type LocalPlayer = {
  key: string
  id_jugador?: number
  nombre: string
  fecha_nacimiento: string
  genero: string
}

function toLocal(j: Jugador): LocalPlayer {
  return {
    key: String(j.id_jugador),
    id_jugador: j.id_jugador,
    nombre: j.nombre,
    fecha_nacimiento: j.fecha_nacimiento.slice(0, 10),
    genero: j.genero,
  }
}

function snapshotPlayers(list: LocalPlayer[]) {
  const m = new Map<number, LocalPlayer>()
  for (const p of list) {
    if (p.id_jugador) m.set(p.id_jugador, { ...p })
  }
  return m
}

export function EquipoFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { federacion } = useFederacion()

  const [nombre, setNombre] = useState('')
  const [players, setPlayers] = useState<LocalPlayer[]>([])
  const initialServer = useRef<Map<number, LocalPlayer>>(new Map())

  const [pNombre, setPNombre] = useState('')
  const [pFecha, setPFecha] = useState('')
  const [pGenero, setPGenero] = useState<string>('M')
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fechaNacFutura = useMemo(() => isFutureIsoDate(pFecha), [pFecha])

  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const eq = await getEquipo(Number(id), { with_jugadores: true, con_inactivos: true })
        if (cancelled) return
        setNombre(eq.nombre)
        const list = (eq.jugadores ?? []).filter((j) => j.estado !== 0).map(toLocal)
        setPlayers(list)
        initialServer.current = snapshotPlayers(list)
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'No se pudo cargar el equipo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  function beginAdd() {
    setEditingKey(null)
    setPNombre('')
    setPFecha('')
    setPGenero('M')
  }

  function beginEdit(p: LocalPlayer) {
    setEditingKey(p.key)
    setPNombre(p.nombre)
    setPFecha(p.fecha_nacimiento)
    setPGenero(p.genero || 'M')
  }

  function addOrMergeLocal() {
    setError(null)
    if (!pNombre.trim()) {
      setError('El nombre del jugador es obligatorio.')
      return
    }
    if (!pFecha) {
      setError('Indique la fecha de nacimiento.')
      return
    }
    if (fechaNacFutura) {
      setError('La fecha de nacimiento no puede ser futura.')
      return
    }

    if (editingKey) {
      setPlayers((prev) =>
        prev.map((row) =>
          row.key === editingKey
            ? { ...row, nombre: pNombre.trim(), fecha_nacimiento: pFecha, genero: pGenero }
            : row,
        ),
      )
      beginAdd()
      return
    }

    setPlayers((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        nombre: pNombre.trim(),
        fecha_nacimiento: pFecha,
        genero: pGenero,
      },
    ])
    beginAdd()
  }

  function removeLocal(key: string) {
    setPlayers((prev) => prev.filter((p) => p.key !== key))
    if (editingKey === key) beginAdd()
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!federacion) return
    setError(null)
    if (!nombre.trim()) {
      setError('El nombre del equipo es obligatorio.')
      return
    }

    setSaving(true)
    try {
      if (!isEdit) {
        const eq = await createEquipoUnderFederacion(federacion.id_federacion, { nombre: nombre.trim() })
        for (const p of players) {
          await createJugador(eq.id_equipo, {
            nombre: p.nombre,
            fecha_nacimiento: p.fecha_nacimiento,
            genero: p.genero,
          })
        }
        navigate('/app/equipos', { replace: true })
        return
      }

      const idEquipo = Number(id)
      await updateEquipo(idEquipo, { nombre: nombre.trim() })

      const currentIds = new Set<number>()
      for (const p of players) {
        if (p.id_jugador) currentIds.add(p.id_jugador)
      }
      for (const jid of initialServer.current.keys()) {
        if (!currentIds.has(jid)) {
          await deleteJugador(jid)
        }
      }

      for (const p of players) {
        if (!p.id_jugador) {
          await createJugador(idEquipo, {
            nombre: p.nombre,
            fecha_nacimiento: p.fecha_nacimiento,
            genero: p.genero,
          })
        } else {
          const orig = initialServer.current.get(p.id_jugador)
          const changed =
            !orig ||
            orig.nombre !== p.nombre ||
            orig.fecha_nacimiento !== p.fecha_nacimiento ||
            orig.genero !== p.genero
          if (changed) {
            await updateJugador(p.id_jugador, {
              nombre: p.nombre,
              fecha_nacimiento: p.fecha_nacimiento,
              genero: p.genero,
            })
          }
        }
      }

      navigate('/app/equipos', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Cargando equipo…</p>
      </div>
    )
  }

  return (
    <form className="page page--equipo-form" onSubmit={onSave}>
      <div className="equipo-form-grid">
        <section className="card">
          <h1 className="card__title">{isEdit ? 'Editar equipo' : 'Nuevo equipo'}</h1>
          <label className="field">
            <span className="field__label">Nombre del equipo</span>
            <input
              className="field__input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={255}
              placeholder="Ej. Marranitos FC"
            />
          </label>

          <h2 className="card__subtitle">Jugadores</h2>
          <ul className="player-mini-list">
            {players.length === 0 ? <li className="muted">Aún no hay jugadores en el borrador.</li> : null}
            {players.map((p) => (
              <li key={p.key} className="player-mini-row">
                <span>{p.nombre}</span>
                <div className="player-mini-row__actions">
                  <button type="button" className="icon-btn" aria-label={`Editar ${p.nombre}`} onClick={() => beginEdit(p)}>
                    ✎
                  </button>
                  <button type="button" className="icon-btn icon-btn--danger" aria-label={`Quitar ${p.nombre}`} onClick={() => removeLocal(p.key)}>
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="card__title">{editingKey ? 'Actualizar jugador' : 'Añadir jugador'}</h2>
          <label className="field">
            <span className="field__label">Nombre</span>
            <input className="field__input" value={pNombre} onChange={(e) => setPNombre(e.target.value)} maxLength={255} />
          </label>
          <label className="field">
            <span className="field__label">Fecha de nacimiento</span>
            <input className="field__input" type="date" value={pFecha} onChange={(e) => setPFecha(e.target.value)} />
            {fechaNacFutura ? (
              <span className="field__hint field__hint--warn" role="alert">
                La fecha no puede ser futura
              </span>
            ) : null}
          </label>
          <label className="field">
            <span className="field__label">Género</span>
            <select className="field__input" value={pGenero} onChange={(e) => setPGenero(e.target.value)}>
              {GENERO_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn--primary btn--pill" onClick={addOrMergeLocal}>
            {editingKey ? '＋ Actualizar jugador' : '＋ Añadir jugador'}
          </button>
        </section>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="form-footer-save">
        <button type="submit" className="btn btn--primary btn--pill btn--wide" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
