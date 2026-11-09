// POST /api/calcular
// Recibe los servicios confirmados por el usuario { servicios: [{ id, cantidad }] }
// y devuelve el desglose con los importes calculados con las tarifas del servidor.
// Si el cliente envía precios o totales, se ignoran.

import { calcularSeleccion, validarSeleccion } from "@/lib/calculo-servicios"
import { respuestaError, respuestaJson } from "@/lib/respuesta-json"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return respuestaError(400, [
      "El cuerpo de la petición no es un JSON válido",
    ])
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return respuestaError(400, [
      "El cuerpo de la petición debe ser un objeto JSON",
    ])
  }

  const resultado = validarSeleccion(
    (body as Record<string, unknown>).servicios
  )
  if ("errores" in resultado) return respuestaError(400, resultado.errores)

  return respuestaJson(calcularSeleccion(resultado.seleccion))
}
