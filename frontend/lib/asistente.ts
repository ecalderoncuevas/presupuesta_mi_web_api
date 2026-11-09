// Llamadas del navegador a las rutas del asistente (mismo servidor Next: /api/...).
// La clave de OpenAI no aparece aquí: la usa solo app/api/propuesta/route.ts.

import { ErrorApi } from "@/lib/api"
import type {
  Propuesta,
  PresupuestoCalculado,
  ServicioSeleccionado,
} from "@/lib/propuesta"

// ErrorApi con un aviso de si tiene sentido volver a intentarlo
export class ErrorAsistente extends ErrorApi {
  reintentar: boolean

  constructor(estado: number, errores: string[], reintentar: boolean) {
    super(estado, errores)
    this.reintentar = reintentar
  }
}

async function enviar<T>(ruta: string, cuerpo: unknown): Promise<T> {
  let respuesta: Response
  try {
    respuesta = await fetch(ruta, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    })
  } catch {
    // Sin conexión con el servidor de Next
    throw new ErrorAsistente(
      0,
      ["No se pudo conectar con el servidor. Comprueba tu conexión."],
      true
    )
  }

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw new ErrorAsistente(
      respuesta.status,
      datos?.errores ?? [`Error ${respuesta.status}`],
      datos?.reintentar === true || respuesta.status >= 500
    )
  }
  return datos as T
}

export function pedirPropuesta(cliente: string, descripcion: string) {
  return enviar<Propuesta>("/api/propuesta", { cliente, descripcion })
}

export function calcularPresupuesto(servicios: ServicioSeleccionado[]) {
  return enviar<PresupuestoCalculado>("/api/calcular", { servicios })
}
