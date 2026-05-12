import type { Equipo, EquipoPayload, Federacion, FederacionPayload, Jugador, JugadorPayload } from '../types/api'
import { apiFetch, unwrapData, unwrapList } from './client'

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const e = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue
    e.set(k, String(v))
  }
  const s = e.toString()
  return s ? `?${s}` : ''
}

export async function listFederaciones(params?: {
  per_page?: number
  q?: string
  with_equipos?: boolean
  con_inactivos?: boolean
}): Promise<Federacion[]> {
  const json = await apiFetch<unknown>(
    `/federaciones${qs({
      per_page: params?.per_page,
      q: params?.q,
      with_equipos: params?.with_equipos ? 1 : undefined,
      con_inactivos: params?.con_inactivos ? 1 : undefined,
    })}`,
  )
  return unwrapList<Federacion>(json)
}

export async function createFederacion(payload: FederacionPayload): Promise<Federacion> {
  const json = await apiFetch<unknown>('/federaciones', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return unwrapData<Federacion>(json)
}

export async function getFederacion(
  id: number,
  params?: { with_equipos?: boolean; con_inactivos?: boolean },
): Promise<Federacion> {
  const json = await apiFetch<unknown>(
    `/federaciones/${id}${qs({
      with_equipos: params?.with_equipos ? 1 : undefined,
      con_inactivos: params?.con_inactivos ? 1 : undefined,
    })}`,
  )
  return unwrapData<Federacion>(json)
}

export async function updateFederacion(id: number, payload: Partial<FederacionPayload & { estado?: 0 | 1 }>): Promise<Federacion> {
  const json = await apiFetch<unknown>(`/federaciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return unwrapData<Federacion>(json)
}

export async function deleteFederacion(id: number): Promise<void> {
  await apiFetch<unknown>(`/federaciones/${id}`, { method: 'DELETE', parse: 'void' })
}

export async function createEquipoUnderFederacion(idFederacion: number, payload: Pick<EquipoPayload, 'nombre'>): Promise<Equipo> {
  const json = await apiFetch<unknown>(`/federaciones/${idFederacion}/equipos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return unwrapData<Equipo>(json)
}

export async function listEquipos(params?: {
  id_federacion?: number
  q?: string
  with_jugadores?: boolean
  con_inactivos?: boolean
  per_page?: number
}): Promise<Equipo[]> {
  const json = await apiFetch<unknown>(
    `/equipos${qs({
      id_federacion: params?.id_federacion,
      q: params?.q,
      with_jugadores: params?.with_jugadores ? 1 : undefined,
      con_inactivos: params?.con_inactivos ? 1 : undefined,
      per_page: params?.per_page,
    })}`,
  )
  return unwrapList<Equipo>(json)
}

export async function createEquipo(payload: EquipoPayload): Promise<Equipo> {
  const json = await apiFetch<unknown>('/equipos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return unwrapData<Equipo>(json)
}

export async function getEquipo(
  id: number,
  params?: { with_jugadores?: boolean; con_inactivos?: boolean },
): Promise<Equipo> {
  const json = await apiFetch<unknown>(
    `/equipos/${id}${qs({
      with_jugadores: params?.with_jugadores ? 1 : undefined,
      con_inactivos: params?.con_inactivos ? 1 : undefined,
    })}`,
  )
  return unwrapData<Equipo>(json)
}

export async function updateEquipo(id: number, payload: Partial<EquipoPayload & { estado?: 0 | 1 }>): Promise<Equipo> {
  const json = await apiFetch<unknown>(`/equipos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return unwrapData<Equipo>(json)
}

export async function deleteEquipo(id: number): Promise<void> {
  await apiFetch<unknown>(`/equipos/${id}`, { method: 'DELETE', parse: 'void' })
}

export async function listJugadoresEquipo(idEquipo: number): Promise<Jugador[]> {
  const json = await apiFetch<unknown>(`/equipos/${idEquipo}/jugadores`)
  return unwrapList<Jugador>(json)
}

export async function createJugador(idEquipo: number, payload: JugadorPayload): Promise<Jugador> {
  const json = await apiFetch<unknown>(`/equipos/${idEquipo}/jugadores`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return unwrapData<Jugador>(json)
}

export async function listJugadoresGlobal(params?: {
  id_equipo?: number
  q?: string
  with_equipo?: boolean
  con_inactivos?: boolean
  per_page?: number
}): Promise<Jugador[]> {
  const json = await apiFetch<unknown>(
    `/jugadores${qs({
      id_equipo: params?.id_equipo,
      q: params?.q,
      with_equipo: params?.with_equipo ? 1 : undefined,
      con_inactivos: params?.con_inactivos ? 1 : undefined,
      per_page: params?.per_page,
    })}`,
  )
  return unwrapList<Jugador>(json)
}

export async function updateJugador(id: number, payload: Partial<JugadorPayload & { estado?: 0 | 1 }>): Promise<Jugador> {
  const json = await apiFetch<unknown>(`/jugadores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return unwrapData<Jugador>(json)
}

export async function deleteJugador(id: number): Promise<void> {
  await apiFetch<unknown>(`/jugadores/${id}`, { method: 'DELETE', parse: 'void' })
}
