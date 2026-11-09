// POST /api/calcular
// Recibe los servicios confirmados por el usuario { servicios: [{ id, cantidad }] }
// y devuelve el desglose con los importes calculados con las tarifas del servidor.
// Si el cliente envía precios o totales, se ignoran.

import { calcularSeleccion, validarSeleccion } from "@/lib/calculo-servicios"

const CABECERA_JSON = { "Content-Type": "application/json; charset=utf-8" }

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return error(400, ["El cuerpo de la petición no es un JSON válido"])
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return error(400, ["El cuerpo de la petición debe ser un objeto JSON"])
  }

  const resultado = validarSeleccion(
    (body as Record<string, unknown>).servicios
  )
  if ("errores" in resultado) return error(400, resultado.errores)

  return Response.json(calcularSeleccion(resultado.seleccion), {
    headers: CABECERA_JSON,
  })
}

function error(estado: number, errores: string[]) {
  return Response.json({ errores }, { status: estado, headers: CABECERA_JSON })
}
