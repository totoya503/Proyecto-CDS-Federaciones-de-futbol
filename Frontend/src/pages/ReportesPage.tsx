import { useEffect, useMemo, useState } from 'react'
import { listJugadoresGlobal } from '../api/sgff'
import { ApiError } from '../api/client'
import { useFederacion } from '../context/FederacionContext'
import { formatDateEs, labelGenero } from '../lib/dates'
import {
  avgAgeByGender,
  averageAge,
  distributionByAge,
  distributionByGender,
  filterJugadoresByFederacion,
  toReportRows,
  type PlayerReportRow,
} from '../lib/reportStats'
import type { Jugador } from '../types/api'

function downloadCsv(filename: string, rows: string[][]) {
  const sep = ';'
  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`
  const body = rows.map((r) => r.map((c) => escape(String(c))).join(sep)).join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function BarRow({
  label,
  value,
  max,
  tone,
}: {
  label: string
  value: number
  max: number
  tone: 'blue' | 'pink' | 'purple'
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="bar-row">
      <div className="bar-row__label">{label}</div>
      <div className="bar-row__track">
        <div className={`bar-row__fill bar-row__fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="bar-row__value">{value}</div>
    </div>
  )
}

export function ReportesPage() {
  const { federacion } = useFederacion()
  const [rows, setRows] = useState<Jugador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!federacion) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listJugadoresGlobal({
          with_equipo: true,
          con_inactivos: false,
          per_page: 500,
        })
        if (!cancelled) setRows(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los jugadores.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [federacion])

  const scoped = useMemo(() => {
    if (!federacion) return []
    return filterJugadoresByFederacion(rows, federacion.id_federacion)
  }, [rows, federacion])

  const equiposCount = useMemo(() => {
    const s = new Set<number>()
    for (const j of scoped) {
      if (j.id_equipo) s.add(j.id_equipo)
    }
    return s.size
  }, [scoped])

  const avg = useMemo(() => averageAge(scoped), [scoped])
  const gen = useMemo(() => distributionByGender(scoped), [scoped])
  const ages = useMemo(() => distributionByAge(scoped), [scoped])
  const avgGen = useMemo(() => avgAgeByGender(scoped), [scoped])
  const tableRows: PlayerReportRow[] = useMemo(
    () => toReportRows(scoped, federacion?.nombre ?? ''),
    [scoped, federacion],
  )

  const maxGen = Math.max(gen.counts.M, gen.counts.F, gen.counts.O, 1)
  const maxAge = Math.max(...Object.values(ages), 1)

  function exportPlayersCsv() {
    const header = ['ID', 'Jugador', 'Fecha nacimiento', 'Edad', 'Género', 'Equipo', 'Federación']
    const data = tableRows.map((r) => [
      String(r.id_jugador).padStart(3, '0'),
      r.nombre,
      formatDateEs(r.fecha_nacimiento.slice(0, 10)),
      String(r.edad),
      labelGenero(r.genero),
      r.equipo,
      r.federacion,
    ])
    downloadCsv('reporte-jugadores.csv', [header, ...data])
  }

  function exportDistribCsv() {
    const header = ['Categoría', 'Cantidad', 'Porcentaje', 'Edad promedio']
    const data = [
      ['Jugadores masculinos', String(gen.counts.M), `${gen.pct.M.toFixed(1)}%`, Number.isFinite(avgGen.M) ? `${avgGen.M.toFixed(1)} años` : '—'],
      ['Jugadoras femeninas', String(gen.counts.F), `${gen.pct.F.toFixed(1)}%`, Number.isFinite(avgGen.F) ? `${avgGen.F.toFixed(1)} años` : '—'],
      ['Otros géneros', String(gen.counts.O), `${gen.pct.O.toFixed(1)}%`, Number.isFinite(avgGen.O) ? `${avgGen.O.toFixed(1)} años` : '—'],
    ]
    downloadCsv('reporte-distribucion.csv', [header, ...data])
  }

  function printReport() {
    window.print()
  }

  if (!federacion) return null

  return (
    <div className="page page--reportes" id="reportes-root">
      {loading ? <p className="muted">Cargando datos…</p> : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="report-cards" aria-label="Resumen">
        <article className="report-card">
          <div className="report-card__icon" aria-hidden>
            🏢
          </div>
          <div className="report-card__stat">
            {equiposCount} <span className="report-card__label">Equipos registrados</span>
          </div>
          <button type="button" className="btn btn--dark btn--pill" onClick={printReport}>
            Descargar reporte en PDF
          </button>
        </article>
        <article className="report-card">
          <div className="report-card__icon" aria-hidden>
            👥
          </div>
          <div className="report-card__stat">
            {scoped.length} <span className="report-card__label">Jugadores activos</span>
          </div>
          <button type="button" className="btn btn--dark btn--pill" onClick={printReport}>
            Descargar reporte en PDF
          </button>
        </article>
        <article className="report-card">
          <div className="report-card__icon" aria-hidden>
            📈
          </div>
          <div className="report-card__stat">
            {Number.isFinite(avg) ? Math.round(avg) : '—'}{' '}
            <span className="report-card__label">Edad promedio</span>
          </div>
          <button type="button" className="btn btn--dark btn--pill" onClick={printReport}>
            Descargar reporte en PDF
          </button>
        </article>
      </section>

      <section className="card card--table-block print-break-after">
        <h2 className="card__title">Reporte 2: Listado de jugadores por equipo</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Jugador</th>
                <th>Fecha nacimiento</th>
                <th>Edad</th>
                <th>Género</th>
                <th>Equipo</th>
                <th>Federación</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r) => (
                <tr key={r.id_jugador}>
                  <td>{String(r.id_jugador).padStart(3, '0')}</td>
                  <td>{r.nombre}</td>
                  <td>{formatDateEs(r.fecha_nacimiento.slice(0, 10))}</td>
                  <td>{r.edad}</td>
                  <td>
                    <span className={`pill pill--${r.genero === 'F' ? 'f' : r.genero === 'M' ? 'm' : 'o'}`}>{labelGenero(r.genero)}</span>
                  </td>
                  <td>{r.equipo}</td>
                  <td>{r.federacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card report-3 print-break-before">
        <h2 className="card__title">Reporte 3: Distribución por género y rangos de edad</h2>
        <div className="report-3-grid">
          <div>
            <h3 className="card__subtitle">Distribución por género</h3>
            <BarRow label="Masculino" value={gen.counts.M} max={maxGen} tone="blue" />
            <p className="bar-caption">
              {gen.counts.M} ({gen.pct.M.toFixed(1)}%)
            </p>
            <BarRow label="Femenino" value={gen.counts.F} max={maxGen} tone="pink" />
            <p className="bar-caption">
              {gen.counts.F} ({gen.pct.F.toFixed(1)}%)
            </p>
            <BarRow label="Otro" value={gen.counts.O} max={maxGen} tone="purple" />
            <p className="bar-caption">
              {gen.counts.O} ({gen.pct.O.toFixed(1)}%)
            </p>
          </div>
          <div>
            <h3 className="card__subtitle">Distribución por rango de edad</h3>
            <BarRow label="18-22 años" value={ages['18-22']} max={maxAge} tone="purple" />
            <BarRow label="23-27 años" value={ages['23-27']} max={maxAge} tone="purple" />
            <BarRow label="28-32 años" value={ages['28-32']} max={maxAge} tone="purple" />
            <BarRow label="33+ años" value={ages['33+']} max={maxAge} tone="purple" />
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
                <th>Edad promedio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Jugadores masculinos</td>
                <td>{gen.counts.M}</td>
                <td>{gen.pct.M.toFixed(1)}%</td>
                <td>{Number.isFinite(avgGen.M) ? `${avgGen.M.toFixed(1)} años` : '—'}</td>
              </tr>
              <tr>
                <td>Jugadoras femeninas</td>
                <td>{gen.counts.F}</td>
                <td>{gen.pct.F.toFixed(1)}%</td>
                <td>{Number.isFinite(avgGen.F) ? `${avgGen.F.toFixed(1)} años` : '—'}</td>
              </tr>
              <tr>
                <td>Otros géneros</td>
                <td>{gen.counts.O}</td>
                <td>{gen.pct.O.toFixed(1)}%</td>
                <td>{Number.isFinite(avgGen.O) ? `${avgGen.O.toFixed(1)} años` : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-actions no-print">
          <button type="button" className="btn btn--light btn--pill" onClick={printReport}>
            Exportar a PDF (imprimir)
          </button>
          <button type="button" className="btn btn--light btn--pill" onClick={exportPlayersCsv}>
            Exportar jugadores a Excel (CSV)
          </button>
          <button type="button" className="btn btn--light btn--pill" onClick={exportDistribCsv}>
            Exportar distribución a Excel (CSV)
          </button>
          <button type="button" className="btn btn--light btn--pill" onClick={printReport}>
            Imprimir
          </button>
        </div>
      </section>
    </div>
  )
}
