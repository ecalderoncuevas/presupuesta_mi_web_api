// POST /api/presupuesto → valida la solicitud y devuelve el presupuesto desglosado

import { calcularPresupuesto, validarSolicitud } from "@/lib/api-presupuestos"
import type { SolicitudPresupuesto } from "@/lib/api"
import {
  leerCuerpoJson,
  respuestaError,
  respuestaJson,
} from "@/lib/respuesta-json"

export async function POST(request: Request) {
  const lectura = await leerCuerpoJson(request)
  if ("errorJson" in lectura) {
    return respuestaError(400, [
      "El cuerpo de la petición no es un JSON válido",
    ])
  }

  const errores = validarSolicitud(lectura.cuerpo)

  // Si la solicitud es incorrecta: 400 y no se calcula nada
  if (errores.length > 0) return respuestaError(400, errores)

  // Solo se pasan los 4 campos: las propiedades extra (p. ej. "total") se ignoran
  const { tipo, paginas, formulario, segundoIdioma } =
    lectura.cuerpo as SolicitudPresupuesto
  return respuestaJson(
    calcularPresupuesto({ tipo, paginas, formulario, segundoIdioma })
  )
}
