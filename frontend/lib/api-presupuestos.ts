// Lógica de la API de presupuestos del dashboard (GET /api/tarifas, POST /api/presupuesto)
// para las rutas del servidor de Next.js. Es la misma que backend_API/src
// (tarifas.js, validacion.js y calculo.js), con las mismas reglas y los mismos mensajes,
// para que la app completa se pueda desplegar en Vercel como un solo proyecto.

import { CATALOGO, MONEDA } from "@/lib/catalogo"
import type {
  ClaveTarifa,
  Presupuesto,
  SolicitudPresupuesto,
  Tarifas,
} from "@/lib/api"

export { MONEDA }

// Tarifas del servidor: salen del catálogo, única fuente de precios en el frontend
export const TARIFAS: Readonly<Tarifas> = Object.freeze(
  Object.fromEntries(CATALOGO.map((s) => [s.id, s.precio])) as Record<
    ClaveTarifa,
    number
  >
)

const CAMPOS_OBLIGATORIOS = ["tipo", "paginas", "formulario", "segundoIdioma"]
const TIPOS_VALIDOS = ["landing", "corporativa"]

// Valida el cuerpo de una solicitud de presupuesto.
// Devuelve un array de mensajes de error (vacío si la solicitud es válida).
export function validarSolicitud(body: unknown): string[] {
  const errores: string[] = []

  // ① El cuerpo debe ser un objeto (ni null, ni array, ni undefined)
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return ["El cuerpo de la petición debe ser un objeto JSON"]
  }

  // ② Deben estar los cuatro campos obligatorios
  for (const campo of CAMPOS_OBLIGATORIOS) {
    if (!Object.hasOwn(body, campo)) {
      errores.push(`Falta el campo obligatorio: ${campo}`)
    }
  }
  if (errores.length > 0) return errores

  const { tipo, paginas, formulario, segundoIdioma } = body as Record<
    string,
    unknown
  >

  // ③ tipo: "landing" o "corporativa"
  if (typeof tipo !== "string" || !TIPOS_VALIDOS.includes(tipo)) {
    errores.push("tipo debe ser 'landing' o 'corporativa'")
  }

  // ④ paginas: número entero entre 1 y 20 ("4" y 2.5 no son válidos)
  if (
    !Number.isInteger(paginas) ||
    (paginas as number) < 1 ||
    (paginas as number) > 20
  ) {
    errores.push("paginas debe ser un número entero entre 1 y 20")
  }

  // ⑤ formulario y segundoIdioma: booleanos ("false" no es válido)
  if (typeof formulario !== "boolean") {
    errores.push("formulario debe ser un booleano (true o false)")
  }
  if (typeof segundoIdioma !== "boolean") {
    errores.push("segundoIdioma debe ser un booleano (true o false)")
  }

  return errores
}

// Calcula el presupuesto a partir de datos ya validados.
// Función pura: solo usa las tarifas del servidor.
export function calcularPresupuesto({
  tipo,
  paginas,
  formulario,
  segundoIdioma,
}: SolicitudPresupuesto): Presupuesto {
  const base = TARIFAS[tipo] // La base incluye la primera página
  const paginasAdicionales = (paginas - 1) * TARIFAS.paginaAdicional
  const costeFormulario = formulario ? TARIFAS.formulario : 0
  const costeSegundoIdioma = segundoIdioma ? TARIFAS.segundoIdioma : 0

  const total = base + paginasAdicionales + costeFormulario + costeSegundoIdioma

  return {
    base,
    paginasAdicionales,
    formulario: costeFormulario,
    segundoIdioma: costeSegundoIdioma,
    total,
    moneda: MONEDA,
  }
}
