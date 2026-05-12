/** ISO yyyy-mm-dd */
export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isFutureIsoDate(value: string): boolean {
  if (!value) return false
  return value > todayIso()
}

export function calcAgeYears(fechaNacimientoIso: string, ref = new Date()): number {
  const [y, m, d] = fechaNacimientoIso.split('-').map(Number)
  if (!y || !m || !d) return NaN
  const birth = new Date(y, m - 1, d)
  let age = ref.getFullYear() - birth.getFullYear()
  const md = ref.getMonth() - birth.getMonth()
  if (md < 0 || (md === 0 && ref.getDate() < birth.getDate())) age -= 1
  return age
}

export function formatDateEs(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export const GENERO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
] as const

export function labelGenero(code: string): string {
  return GENERO_OPTIONS.find((g) => g.value === code)?.label ?? code
}
