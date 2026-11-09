// GET /api/tarifas → devuelve las tarifas que usa el servidor

import { MONEDA, TARIFAS } from "@/lib/api-presupuestos"
import { respuestaJson } from "@/lib/respuesta-json"

export function GET() {
  return respuestaJson({ tarifas: TARIFAS, moneda: MONEDA })
}
