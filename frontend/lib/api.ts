// Cliente de la API de presupuestos (backend_API).
// Todas las llamadas al servidor pasan por este archivo.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export type ClaveTarifa =
  | "landing"
  | "corporativa"
  | "paginaAdicional"
  | "formulario"
  | "segundoIdioma"

export type Tarifas = Record<ClaveTarifa, number>

export type RespuestaTarifas = {
  tarifas: Tarifas
  moneda: string
}

export type SolicitudPresupuesto = {
  tipo: "landing" | "corporativa"
  paginas: number
  formulario: boolean
  segundoIdioma: boolean
}

export type Presupuesto = {
  base: number
  paginasAdicionales: number
  formulario: number
  segundoIdioma: number
  total: number
  moneda: string
}

// Error con el código HTTP y la lista de mensajes que devuelve la API: { errores: [...] }
export class ErrorApi extends Error {
  estado: number
  errores: string[]

  constructor(estado: number, errores: string[]) {
    super(errores.join(" · "))
    this.estado = estado
    this.errores = errores
  }
}

async function pedir<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, opciones)
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, datos.errores ?? [`Error ${respuesta.status}`])
  }
  return datos as T
}

export function obtenerEstado() {
  return pedir<{ status: string }>("/api/estado")
}

export function obtenerTarifas() {
  return pedir<RespuestaTarifas>("/api/tarifas")
}

export function pedirPresupuesto(solicitud: SolicitudPresupuesto) {
  return pedir<Presupuesto>("/api/presupuesto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(solicitud),
  })
}
