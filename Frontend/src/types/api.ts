export type EstadoRegistro = 0 | 1

export interface Federacion {
  id_federacion: number
  nombre: string
  fecha_fundacion: string
  departamento: string
  municipio: string
  direccion: string
  estado?: EstadoRegistro
  created_at?: string
  updated_at?: string
  equipos?: Equipo[]
}

export interface Equipo {
  id_equipo: number
  nombre: string
  id_federacion: number
  estado?: EstadoRegistro
  created_at?: string
  updated_at?: string
  jugadores?: Jugador[]
  federacion?: Federacion
}

export interface Jugador {
  id_jugador: number
  nombre: string
  fecha_nacimiento: string
  genero: string
  id_equipo: number
  estado?: EstadoRegistro
  created_at?: string
  updated_at?: string
  equipo?: Equipo
}

export interface FederacionPayload {
  nombre: string
  fecha_fundacion: string
  departamento: string
  municipio: string
  direccion: string
}

export interface EquipoPayload {
  nombre: string
  id_federacion?: number
}

export interface JugadorPayload {
  nombre: string
  fecha_nacimiento: string
  genero: string
}
