const STORAGE_ID = 'sgff_federacion_id'
const STORAGE_NOMBRE = 'sgff_federacion_nombre'

export function readStoredFederacion(): { id_federacion: number; nombre: string } | null {
  const idRaw = localStorage.getItem(STORAGE_ID)
  const nombre = localStorage.getItem(STORAGE_NOMBRE)
  if (!idRaw || !nombre) return null
  const id_federacion = Number(idRaw)
  if (!Number.isFinite(id_federacion)) return null
  return { id_federacion, nombre }
}

export function writeStoredFederacion(f: { id_federacion: number; nombre: string }): void {
  localStorage.setItem(STORAGE_ID, String(f.id_federacion))
  localStorage.setItem(STORAGE_NOMBRE, f.nombre)
}

export function clearStoredFederacion(): void {
  localStorage.removeItem(STORAGE_ID)
  localStorage.removeItem(STORAGE_NOMBRE)
}
