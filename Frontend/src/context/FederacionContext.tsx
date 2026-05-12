import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { clearStoredFederacion, readStoredFederacion, writeStoredFederacion } from '../lib/federacionStorage'

export interface FederacionSession {
  id_federacion: number
  nombre: string
}

interface FederacionContextValue {
  federacion: FederacionSession | null
  setFederacion: (f: FederacionSession | null) => void
  logoutFederacion: () => void
}

const FederacionContext = createContext<FederacionContextValue | undefined>(undefined)

export function FederacionProvider({ children }: { children: ReactNode }) {
  const [federacion, setFederacionState] = useState<FederacionSession | null>(() => readStoredFederacion())

  const setFederacion = useCallback((f: FederacionSession | null) => {
    setFederacionState(f)
    if (f) writeStoredFederacion(f)
    else clearStoredFederacion()
  }, [])

  const logoutFederacion = useCallback(() => {
    setFederacionState(null)
    clearStoredFederacion()
  }, [])

  const value = useMemo(
    () => ({ federacion, setFederacion, logoutFederacion }),
    [federacion, setFederacion, logoutFederacion],
  )

  return <FederacionContext.Provider value={value}>{children}</FederacionContext.Provider>
}

export function useFederacion(): FederacionContextValue {
  const ctx = useContext(FederacionContext)
  if (!ctx) throw new Error('useFederacion debe usarse dentro de FederacionProvider')
  return ctx
}
