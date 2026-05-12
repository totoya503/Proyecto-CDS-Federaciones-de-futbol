import { type FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { createFederacion } from '../api/sgff'
import { ApiError } from '../api/client'
import { useFederacion } from '../context/FederacionContext'
import { isFutureIsoDate } from '../lib/dates'

const MAX_LEN = {
  nombre: 255,
  departamento: 120,
  municipio: 120,
  direccion: 500,
} as const

export function RegistroFederacionPage() {
  const navigate = useNavigate()
  const { federacion: sessionFed, setFederacion } = useFederacion()
  const [nombre, setNombre] = useState('')
  const [fechaFundacion, setFechaFundacion] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [direccion, setDireccion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fechaFutura = useMemo(() => isFutureIsoDate(fechaFundacion), [fechaFundacion])

  function reset() {
    setNombre('')
    setFechaFundacion('')
    setDepartamento('')
    setMunicipio('')
    setDireccion('')
    setError(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre.trim()) {
      setError('El nombre de la federación es obligatorio.')
      return
    }
    if (nombre.trim().length > MAX_LEN.nombre) {
      setError(`El nombre no puede superar ${MAX_LEN.nombre} caracteres.`)
      return
    }
    if (!fechaFundacion) {
      setError('Indique la fecha de fundación.')
      return
    }
    if (fechaFutura) {
      setError('La fecha de fundación no puede ser futura.')
      return
    }
    if (!departamento.trim() || !municipio.trim() || !direccion.trim()) {
      setError('Complete departamento, municipio y dirección.')
      return
    }
    if (departamento.length > MAX_LEN.departamento || municipio.length > MAX_LEN.municipio || direccion.length > MAX_LEN.direccion) {
      setError('Revise las longitudes máximas de los campos de ubicación.')
      return
    }

    setSubmitting(true)
    try {
      const f = await createFederacion({
        nombre: nombre.trim(),
        fecha_fundacion: fechaFundacion,
        departamento: departamento.trim(),
        municipio: municipio.trim(),
        direccion: direccion.trim(),
      })
      setFederacion({ id_federacion: f.id_federacion, nombre: f.nombre })
      navigate('/app/inicio', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'No se pudo guardar la federación.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page--form-outer">
      <AppHeader variant="marketing" />
      <div className="form-outer">
        <h1 className="form-outer__h1">Registro de federación</h1>
        <p className="form-outer__sub">Complete los datos de su federación para comenzar a gestionar equipos y jugadores.</p>

        {sessionFed ? (
          <p className="form-outer__sub">
            Ya hay una federación en esta sesión ({sessionFed.nombre}).{' '}
            <Link to="/app/inicio">Ir al panel</Link> o registre otra federación abajo (sobrescribirá la sesión actual al guardar).
          </p>
        ) : null}

        <form className="card card--form" onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <label className="field">
              <span className="field__label">Nombre de la federación</span>
              <input
                className="field__input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={MAX_LEN.nombre}
                autoComplete="organization"
                placeholder="Ej. CONCACUF"
              />
            </label>
            <label className="field">
              <span className="field__label">Ciudad / Municipio</span>
              <input
                className="field__input"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                maxLength={MAX_LEN.municipio}
                placeholder="Ej. Los Ángeles"
              />
            </label>

            <label className="field">
              <span className="field__label">Fecha de fundación</span>
              <input
                className="field__input"
                type="date"
                value={fechaFundacion}
                onChange={(e) => setFechaFundacion(e.target.value)}
              />
              {fechaFutura ? (
                <span className="field__hint field__hint--warn" role="alert">
                  La fecha no puede ser futura
                </span>
              ) : null}
            </label>

            <label className="field">
              <span className="field__label">Dirección (complemento)</span>
              <textarea
                className="field__input field__input--textarea"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                maxLength={MAX_LEN.direccion}
                rows={4}
                placeholder="Calle, número, referencias"
              />
            </label>

            <label className="field">
              <span className="field__label">Estado / Departamento</span>
              <input
                className="field__input"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                maxLength={MAX_LEN.departamento}
                placeholder="Ej. California"
              />
            </label>
          </div>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="form-actions">
            <button type="submit" className="btn btn--primary btn--pill" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar y continuar'}
            </button>
            <button type="button" className="btn btn--secondary btn--pill" onClick={reset} disabled={submitting}>
              Limpiar formulario
            </button>
          </div>
        </form>

        <p className="eula-note">Al continuar acepta los términos y condiciones en el EULA.</p>
      </div>
    </div>
  )
}
