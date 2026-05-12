import type { Jugador } from '../types/api'
import { calcAgeYears } from './dates'

export interface PlayerReportRow {
  id_jugador: number
  nombre: string
  fecha_nacimiento: string
  edad: number
  genero: string
  equipo: string
  federacion: string
}

function isActive(j: Jugador): boolean {
  return j.estado !== 0
}

export function filterJugadoresByFederacion(jugadores: Jugador[], idFederacion: number): Jugador[] {
  return jugadores.filter((j) => {
    if (!isActive(j)) return false
    const fid = j.equipo?.id_federacion
    return fid === idFederacion
  })
}

export function toReportRows(jugadores: Jugador[], federationName: string): PlayerReportRow[] {
  return jugadores.map((j) => ({
    id_jugador: j.id_jugador,
    nombre: j.nombre,
    fecha_nacimiento: j.fecha_nacimiento,
    edad: calcAgeYears(j.fecha_nacimiento.slice(0, 10)),
    genero: j.genero,
    equipo: j.equipo?.nombre ?? '—',
    federacion: j.equipo?.federacion?.nombre ?? federationName,
  }))
}

export function averageAge(jugadores: Jugador[]): number {
  const ages = jugadores.map((j) => calcAgeYears(j.fecha_nacimiento.slice(0, 10))).filter((n) => Number.isFinite(n))
  if (!ages.length) return NaN
  return ages.reduce((a, b) => a + b, 0) / ages.length
}

export type AgeBucketKey = '18-22' | '23-27' | '28-32' | '33+'

export function ageBucket(age: number): AgeBucketKey {
  if (!Number.isFinite(age)) return '18-22'
  if (age <= 22) return '18-22'
  if (age <= 27) return '23-27'
  if (age <= 32) return '28-32'
  return '33+'
}

export function distributionByGender(jugadores: Jugador[]) {
  const counts = { M: 0, F: 0, O: 0 }
  for (const j of jugadores) {
    const g = j.genero === 'F' ? 'F' : j.genero === 'M' ? 'M' : 'O'
    counts[g] += 1
  }
  const total = jugadores.length || 1
  return {
    counts,
    pct: {
      M: (counts.M / total) * 100,
      F: (counts.F / total) * 100,
      O: (counts.O / total) * 100,
    },
  }
}

export function distributionByAge(jugadores: Jugador[]) {
  const buckets: Record<AgeBucketKey, number> = {
    '18-22': 0,
    '23-27': 0,
    '28-32': 0,
    '33+': 0,
  }
  for (const j of jugadores) {
    const age = calcAgeYears(j.fecha_nacimiento.slice(0, 10))
    if (!Number.isFinite(age)) continue
    buckets[ageBucket(age)] += 1
  }
  return buckets
}

export function avgAgeByGender(jugadores: Jugador[]) {
  const by = { M: [] as number[], F: [] as number[], O: [] as number[] }
  for (const j of jugadores) {
    const age = calcAgeYears(j.fecha_nacimiento.slice(0, 10))
    if (!Number.isFinite(age)) continue
    const g = j.genero === 'F' ? 'F' : j.genero === 'M' ? 'M' : 'O'
    by[g].push(age)
  }
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN)
  return { M: mean(by.M), F: mean(by.F), O: mean(by.O) }
}
