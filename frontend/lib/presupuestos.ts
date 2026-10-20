import type { Presupuesto, SolicitudPresupuesto } from "@/lib/api"
import { CONCEPTOS } from "@/lib/formato"

export type TipoWeb = SolicitudPresupuesto["tipo"]

// Presupuesto calculado por la API y guardado solo en memoria (sin base de datos)
export type Registro = {
  id: number
  solicitud: SolicitudPresupuesto
  presupuesto: Presupuesto
}

// Valores del formulario. `paginas` es texto para poder enviar 0, 21 o 2.5
// y comprobar cómo responde el servidor.
export type Borrador = {
  tipo: TipoWeb
  paginas: string
  formulario: boolean
  segundoIdioma: boolean
}

// Respuesta mostrada en el panel JSON
export type RespuestaApi = {
  estado: number | null
  cuerpo: unknown
  etiqueta: string
  milisegundos: number
}

export const BORRADOR_INICIAL: Borrador = {
  tipo: "corporativa",
  paginas: "4",
  formulario: true,
  segundoIdioma: false,
}

// Casos válidos 1 a 4 del enunciado: el panel arranca con ellos calculados por la API
export const CASOS_INICIALES: SolicitudPresupuesto[] = [
  { tipo: "landing", paginas: 1, formulario: false, segundoIdioma: false },
  { tipo: "corporativa", paginas: 4, formulario: true, segundoIdioma: false },
  { tipo: "landing", paginas: 2, formulario: true, segundoIdioma: true },
  { tipo: "landing", paginas: 20, formulario: false, segundoIdioma: false },
]

export function codigo(id: number) {
  return `P-${String(id).padStart(3, "0")}`
}

export function aSolicitud(borrador: Borrador): SolicitudPresupuesto {
  return {
    tipo: borrador.tipo,
    paginas: Number(borrador.paginas),
    formulario: borrador.formulario,
    segundoIdioma: borrador.segundoIdioma,
  }
}

export function aBorrador(solicitud: SolicitudPresupuesto): Borrador {
  return { ...solicitud, paginas: String(solicitud.paginas) }
}

export function resumen(solicitud: SolicitudPresupuesto) {
  const paginas = `${solicitud.paginas} ${solicitud.paginas === 1 ? "página" : "páginas"}`
  return `${CONCEPTOS[solicitud.tipo].nombre} · ${paginas}`
}
