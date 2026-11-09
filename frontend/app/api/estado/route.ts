// GET /api/estado → confirma que el servicio funciona

import { respuestaJson } from "@/lib/respuesta-json"

// Se ejecuta en cada petición: si el servidor no responde, el dashboard lo detecta
export const dynamic = "force-dynamic"

export function GET() {
  return respuestaJson({ status: "ok" })
}
