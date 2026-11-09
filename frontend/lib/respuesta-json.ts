// Respuestas JSON comunes de las rutas del servidor (app/api/**/route.ts).

// charset explícito: sin él, algunos clientes (p. ej. Windows PowerShell 5.1) leen mal los acentos
const CABECERA_JSON = { "Content-Type": "application/json; charset=utf-8" }

export function respuestaJson(datos: unknown, estado = 200) {
  return Response.json(datos, { status: estado, headers: CABECERA_JSON })
}

// Errores con el mismo formato que la API de Express: { "errores": [ ... ] }
export function respuestaError(
  estado: number,
  errores: string[],
  extra?: Record<string, unknown>
) {
  return respuestaJson({ errores, ...extra }, estado)
}

// Lee el cuerpo como JSON. Igual que express.json():
// - si no llega "Content-Type: application/json", el cuerpo se considera vacío (undefined);
// - modo estricto: solo se aceptan objetos y arrays ("null", "4" o "true" son JSON no válido).
export async function leerCuerpoJson(
  request: Request
): Promise<{ cuerpo: unknown } | { errorJson: true }> {
  const tipo = request.headers.get("content-type") ?? ""
  if (!tipo.toLowerCase().includes("application/json"))
    return { cuerpo: undefined }

  try {
    const cuerpo: unknown = await request.json()
    if (typeof cuerpo !== "object" || cuerpo === null)
      return { errorJson: true }
    return { cuerpo }
  } catch {
    return { errorJson: true }
  }
}
