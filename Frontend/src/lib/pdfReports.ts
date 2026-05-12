import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PlayerReportRow } from './reportStats'

type JsPdfWithTable = jsPDF & { lastAutoTable?: { finalY: number } }

function nextY(doc: jsPDF, fallback: number): number {
  const d = doc as JsPdfWithTable
  return d.lastAutoTable?.finalY != null ? d.lastAutoTable.finalY + 10 : fallback
}

export function downloadPdfEquipos(
  federationName: string,
  rows: { id_equipo: number; nombre: string; jugadoresActivos: number }[],
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.setFontSize(16)
  doc.text('Reporte: Equipos registrados', 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(`Federación: ${federationName}`, 14, 26)
  doc.setTextColor(0, 0, 0)

  const head = [['ID', 'Equipo', 'Jugadores activos']]
  const body = rows.map((e) => [
    String(e.id_equipo).padStart(3, '0'),
    e.nombre,
    String(e.jugadoresActivos),
  ])

  autoTable(doc, {
    startY: 32,
    head,
    body,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [30, 95, 191], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
  })

  doc.save('reporte-equipos.pdf')
}

export function downloadPdfJugadores(federationName: string, rows: PlayerReportRow[]): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text('Reporte 2: Listado de jugadores por equipo', 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(`Federación: ${federationName}`, 14, 24)
  doc.setTextColor(0, 0, 0)

  const head = [['ID', 'Jugador', 'Fecha nac.', 'Edad', 'Género', 'Equipo', 'Federación']]
  const body = rows.map((r) => [
    String(r.id_jugador).padStart(3, '0'),
    r.nombre,
    formatShortDate(r.fecha_nacimiento),
    String(r.edad),
    labelGeneroPdf(r.genero),
    r.equipo,
    r.federacion,
  ])

  autoTable(doc, {
    startY: 30,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [30, 95, 191], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    columnStyles: { 1: { cellWidth: 55 } },
  })

  doc.save('reporte-jugadores.pdf')
}

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function labelGeneroPdf(code: string): string {
  if (code === 'M') return 'Masculino'
  if (code === 'F') return 'Femenino'
  return 'Otro'
}

export function downloadPdfDistribucion(input: {
  federationName: string
  counts: { M: number; F: number; O: number }
  pct: { M: number; F: number; O: number }
  avgGen: { M: number; F: number; O: number }
  ages: Record<'18-22' | '23-27' | '28-32' | '33+', number>
  avgOverall: number
  totalJugadores: number
}): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.setFontSize(16)
  doc.text('Reporte 3: Distribución por género y rangos de edad', 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(`Federación: ${input.federationName}`, 14, 26)
  doc.text(`Jugadores activos considerados: ${input.totalJugadores}`, 14, 32)
  doc.setTextColor(0, 0, 0)

  doc.setFontSize(12)
  doc.text('Distribución por género', 14, 42)
  doc.setFontSize(10)
  let y = 48
  doc.text(`Masculino: ${input.counts.M} (${input.pct.M.toFixed(1)}%)`, 14, y)
  y += 6
  doc.text(`Femenino: ${input.counts.F} (${input.pct.F.toFixed(1)}%)`, 14, y)
  y += 6
  doc.text(`Otro: ${input.counts.O} (${input.pct.O.toFixed(1)}%)`, 14, y)
  y += 10

  doc.setFontSize(12)
  doc.text('Distribución por rango de edad', 14, y)
  y += 7
  doc.setFontSize(10)
  const order: Array<keyof typeof input.ages> = ['18-22', '23-27', '28-32', '33+']
  for (const k of order) {
    const label = k === '33+' ? '33+ años' : `${k} años`
    doc.text(`${label}: ${input.ages[k]}`, 14, y)
    y += 6
  }

  autoTable(doc, {
    startY: y + 4,
    head: [['Categoría', 'Cantidad', 'Porcentaje', 'Edad promedio']],
    body: [
      [
        'Jugadores masculinos',
        String(input.counts.M),
        `${input.pct.M.toFixed(1)}%`,
        Number.isFinite(input.avgGen.M) ? `${input.avgGen.M.toFixed(1)} años` : '—',
      ],
      [
        'Jugadoras femeninas',
        String(input.counts.F),
        `${input.pct.F.toFixed(1)}%`,
        Number.isFinite(input.avgGen.F) ? `${input.avgGen.F.toFixed(1)} años` : '—',
      ],
      [
        'Otros géneros',
        String(input.counts.O),
        `${input.pct.O.toFixed(1)}%`,
        Number.isFinite(input.avgGen.O) ? `${input.avgGen.O.toFixed(1)} años` : '—',
      ],
    ],
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [30, 95, 191], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
  })

  y = nextY(doc, y + 40)
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  const avgTxt = Number.isFinite(input.avgOverall) ? `${input.avgOverall.toFixed(1)} años` : '—'
  doc.text(`Edad promedio global: ${avgTxt}`, 14, Math.min(y, 270))

  doc.save('reporte-distribucion-edad-genero.pdf')
}
