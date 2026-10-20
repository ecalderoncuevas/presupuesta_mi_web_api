"use client"

import { useEffect, useState } from "react"

type EstadoPeticion<T> = {
  datos: T | null
  error: string | null
  cargando: boolean
}

// Ejecuta una petición a la API al montar el componente.
// `peticion` debe ser una función estable (definida fuera del componente).
export function useApi<T>(peticion: () => Promise<T>): EstadoPeticion<T> {
  const [estado, setEstado] = useState<EstadoPeticion<T>>({
    datos: null,
    error: null,
    cargando: true,
  })

  useEffect(() => {
    let activo = true

    peticion()
      .then((datos) => {
        if (activo) setEstado({ datos, error: null, cargando: false })
      })
      .catch((error: unknown) => {
        const mensaje = error instanceof Error ? error.message : "Error desconocido"
        if (activo) setEstado({ datos: null, error: mensaje, cargando: false })
      })

    return () => {
      activo = false
    }
  }, [peticion])

  return estado
}
