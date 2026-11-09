// Tipos y límites compartidos entre las rutas del servidor (/api/propuesta, /api/calcular)
// y la interfaz del asistente. No contiene nada secreto.

import type { IdServicio } from "@/lib/catalogo"

export const MAX_CLIENTE = 100
export const MAX_DESCRIPCION = 2000
// La web puede tener como máximo 20 páginas: la primera va incluida en el tipo de web
export const MAX_PAGINAS_ADICIONALES = 19

// ----- Respuesta de POST /api/propuesta -----

export type ServicioPropuesto = {
  id: IdServicio
  nombre: string
  descripcion: string
  justificacion: string
  cantidad: number | null
}

export type Propuesta = {
  cliente: string
  resumen: string
  servicios: ServicioPropuesto[]
  aclaraciones: string[]
  fueraDeCatalogo: string[]
  // Servicios que necesitan un dato del usuario antes de poder calcular (p. ej. nº de páginas)
  faltanDatos: IdServicio[]
  // Identificadores que devolvió la IA y el servidor descartó por no estar en el catálogo
  descartados: string[]
  modelo: string
}

// ----- Petición y respuesta de POST /api/calcular -----

// El cliente solo envía QUÉ servicios quiere y cuántas unidades. Nunca precios.
export type ServicioSeleccionado = {
  id: IdServicio
  cantidad: number | null
}

export type LineaPresupuesto = {
  id: IdServicio
  nombre: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  importe: number
}

export type PresupuestoCalculado = {
  lineas: LineaPresupuesto[]
  total: number
  moneda: string
}
