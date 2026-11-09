// Cualquier ruta /api/... que no exista → 404 en JSON (como la API de Express).
// Las rutas concretas (/api/estado, /api/tarifas...) tienen prioridad sobre esta.

import { respuestaError } from "@/lib/respuesta-json"

function noEncontrada() {
  return respuestaError(404, ["Ruta no encontrada"])
}

export {
  noEncontrada as GET,
  noEncontrada as POST,
  noEncontrada as PUT,
  noEncontrada as PATCH,
  noEncontrada as DELETE,
}
