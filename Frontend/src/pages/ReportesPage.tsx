import { useEffect, useMemo, useRef, useState } from 'react'
import { listEquipos, listJugadoresGlobal } from '../api/sgff'
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
import type { Equipo, Jugador } from '../types/api'

type ActiveReport = 'equipos' | 'jugadores' | 'edad' | null

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
  subtitle,
}: {
  label: string
  value: number
  max: number
  tone: 'blue' | 'pink' | 'purple'
  subtitle?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="bar-block">
      <div className="bar-row">
        <div className="bar-row__label">{label}</div>
        <div className="bar-row__track">
          <div className={`bar-row__fill bar-row__fill--${tone}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="bar-row__value">{value}</div>
      </div>
      {subtitle ? <p className="bar-caption bar-caption--indent">{subtitle}</p> : null}
    </div>
  )
}

export function ReportesPage() {
  const { federacion } = useFederacion()
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeReport, setActiveReport] = useState<ActiveReport>(null)
  const detailRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!federacion) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [jData, eData] = await Promise.all([
          listJugadoresGlobal({
            with_equipo: true,
            con_inactivos: false,
            per_page: 500,
          }),
          listEquipos({
            id_federacion: federacion.id_federacion,
            con_inactivos: false,
            per_page: 500,
          }),
        ])
        if (!cancelled) {
          setJugadores(jData)
          setEquipos(eData)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los datos.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [federacion])

  useEffect(() => {
    if (activeReport && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeReport])

  const scoped = useMemo(() => {
    if (!federacion) return []
    return filterJugadoresByFederacion(jugadores, federacion.id_federacion)
  }, [jugadores, federacion])

  const jugadoresPorEquipo = useMemo(() => {
    const m = new Map<number, number>()
    for (const j of scoped) {
      m.set(j.id_equipo, (m.get(j.id_equipo) ?? 0) + 1)
    }
    return m
  }, [scoped])

  const equiposReportRows = useMemo(
    () =>
      equipos.map((e) => ({
        id_equipo: e.id_equipo,
        nombre: e.nombre,
        jugadoresActivos: jugadoresPorEquipo.get(e.id_equipo) ?? 0,
      })),
    [equipos, jugadoresPorEquipo],
  )

  const equiposCount = equipos.length
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

  function exportEquiposCsv() {
    const header = ['ID', 'Equipo', 'Jugadores activos']
    const data = equiposReportRows.map((r) => [String(r.id_equipo).padStart(3, '0'), r.nombre, String(r.jugadoresActivos)])
    downloadCsv('reporte-equipos.csv', [header, ...data])
  }

  async function onPdfEquipos() {
    if (!federacion) return
    try {
      const { downloadPdfEquipos } = await import('../lib/pdfReports')
      downloadPdfEquipos(federacion.nombre, equiposReportRows)
    } catch {
      window.alert('No se pudo generar el PDF. Intente de nuevo.')
    }
  }

  async function onPdfJugadores() {
    if (!federacion) return
    try {
      const { downloadPdfJugadores } = await import('../lib/pdfReports')
      downloadPdfJugadores(federacion.nombre, tableRows)
    } catch {
      window.alert('No se pudo generar el PDF. Intente de nuevo.')
    }
  }

  async function onPdfDistribucion() {
    if (!federacion) return
    try {
      const { downloadPdfDistribucion } = await import('../lib/pdfReports')
      downloadPdfDistribucion({
        federationName: federacion.nombre,
        counts: gen.counts,
        pct: gen.pct,
        avgGen,
        ages,
        avgOverall: avg,
        totalJugadores: scoped.length,
      })
    } catch {
      window.alert('No se pudo generar el PDF. Intente de nuevo.')
    }
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

      <section className="report-cards report-cards--metrics" aria-label="Indicadores">
        <div className="report-metric-col">
          <button
            type="button"
            className={`report-card report-card--clickable ${activeReport === 'equipos' ? 'is-active' : ''}`}
            onClick={() => setActiveReport('equipos')}
            aria-pressed={activeReport === 'equipos'}
            aria-label="Ver reporte de equipos registrados"
          >
            <span className="report-card__icon" aria-hidden>
              🏢
            </span>
            <span className="report-card__stat">
              {equiposCount} <span className="report-card__label">Equipos registrados</span>
            </span>
          </button>
          <button type="button" className="btn btn--dark btn--pill report-metric-col__pdf" onClick={() => void onPdfEquipos()}>
            Descargar reporte en PDF
          </button>
        </div>

        <div className="report-metric-col">
          <button
            type="button"
            className={`report-card report-card--clickable ${activeReport === 'jugadores' ? 'is-active' : ''}`}
            onClick={() => setActiveReport('jugadores')}
            aria-pressed={activeReport === 'jugadores'}
            aria-label="Ver reporte de jugadores activos"
          >
            <span className="report-card__icon" aria-hidden>
              👥
            </span>
            <span className="report-card__stat">
              {scoped.length} <span className="report-card__label">Jugadores activos</span>
            </span>
          </button>
          <button type="button" className="btn btn--dark btn--pill report-metric-col__pdf" onClick={() => void onPdfJugadores()}>
            Descargar reporte en PDF
          </button>
        </div>

        <div className="report-metric-col">
          <button
            type="button"
            className={`report-card report-card--clickable ${activeReport === 'edad' ? 'is-active' : ''}`}
            onClick={() => setActiveReport('edad')}
            aria-pressed={activeReport === 'edad'}
            aria-label="Ver reporte de edad promedio y distribución"
          >
            <span className="report-card__icon" aria-hidden>
              📈
            </span>
            <span className="report-card__stat">
              {Number.isFinite(avg) ? Math.round(avg) : '—'} <span className="report-card__label">Edad promedio</span>
            </span>
          </button>
          <button type="button" className="btn btn--dark btn--pill report-metric-col__pdf" onClick={() => void onPdfDistribucion()}>
            Descargar reporte en PDF
          </button>
        </div>
      </section>

      {!activeReport && !loading ? (
        <p className="report-hint muted">Pulse un indicador para ver el detalle del reporte.</p>
      ) : null}

      <section ref={detailRef} className="report-detail" aria-live="polite">
        {activeReport === 'equipos' ? (
          <div className="card card--table-block">
            <h2 className="card__title">Reporte: Equipos registrados</h2>
            <div className="table-scroll">
              <table className="data-table data-table--compact">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Equipo</th>
                    <th>Jugadores activos</th>
                  </tr>
                </thead>
                <tbody>
                  {equiposReportRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="muted">
                        No hay equipos registrados.
                      </td>
                    </tr>
                  ) : (
                    equiposReportRows.map((r) => (
                      <tr key={r.id_equipo}>
                        <td>{String(r.id_equipo).padStart(3, '0')}</td>
                        <td className="data-table__strong">{r.nombre}</td>
                        <td>{r.jugadoresActivos}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="report-actions no-print">
              <button type="button" className="btn btn--light btn--pill" onClick={() => void onPdfEquipos()}>
                Exportar a PDF
              </button>
              <button type="button" className="btn btn--light btn--pill" onClick={exportEquiposCsv}>
                Exportar a Excel (CSV)
              </button>
              <button type="button" className="btn btn--light btn--pill" onClick={() => window.print()}>
                Imprimir
              </button>
            </div>
          </div>
        ) : null}

        {activeReport === 'jugadores' ? (
          <div className="card card--table-block">
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
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="muted">
                        No hay jugadores activos.
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((r) => (
                      <tr key={r.id_jugador}>
                        <td>{String(r.id_jugador).padStart(3, '0')}</td>
                        <td className="data-table__strong">{r.nombre}</td>
                        <td>{formatDateEs(r.fecha_nacimiento.slice(0, 10))}</td>
                        <td>{r.edad}</td>
                        <td>
                          <span className={`pill pill--${r.genero === 'F' ? 'f' : r.genero === 'M' ? 'm' : 'o'}`}>
                            {labelGenero(r.genero)}
                          </span>
                        </td>
                        <td>{r.equipo}</td>
                        <td>{r.federacion}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="report-actions no-print">
              <button type="button" className="btn btn--light btn--pill" onClick={() => void onPdfJugadores()}>
                Exportar a PDF
              </button>
              <button type="button" className="btn btn--light btn--pill" onClick={exportPlayersCsv}>
                Exportar a Excel (CSV)
              </button>
              <button type="button" className="btn btn--light btn--pill" onClick={() => window.print()}>
                Imprimir
              </button>
            </div>
          </div>
        ) : null}

        {activeReport === 'edad' ? (
          <div className="card report-3">
            <h2 className="card__title">Reporte 3: Distribución por género y rangos de edad</h2>
            <div className="report-3-grid">
              <div>
                <h3 className="card__subtitle">Distribución por género</h3>
                <BarRow
                  label="♂ Masculino"
                  value={gen.counts.M}
                  max={maxGen}
                  tone="blue"
                  subtitle={`${gen.counts.M} (${gen.pct.M.toFixed(1)}%)`}
                />
                <BarRow
                  label="♀ Femenino"
                  value={gen.counts.F}
                  max={maxGen}
                  tone="pink"
                  subtitle={`${gen.counts.F} (${gen.pct.F.toFixed(1)}%)`}
                />
                <BarRow
                  label="⚧ Otro"
                  value={gen.counts.O}
                  max={maxGen}
                  tone="purple"
                  subtitle={`${gen.counts.O} (${gen.pct.O.toFixed(1)}%)`}
                />
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
              <table className="data-table data-table--compact">
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
              <button type="button" className="btn btn--light btn--pill" onClick={() => void onPdfDistribucion()}>
                Exportar a PDF
              </button>
              <button type="button" className="btn btn--light btn--pill" onClick={exportDistribCsv}>
                Exportar a Excel (CSV)
              </button>
              <button type="button" className="btn btn--light btn--pill" onClick={() => window.print()}>
                Imprimir
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
