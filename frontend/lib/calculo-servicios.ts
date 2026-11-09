// Validación y cálculo del presupuesto a partir de los servicios confirmados.
// Lo usa POST /api/calcular: los importes salen SOLO de las tarifas del catálogo.
// Mismas reglas que backend_API (un tipo de web, máximo 20 páginas en total).

import { CATALOGO, MONEDA, esIdDelCatalogo } from "@/lib/catalogo"
import {
  MAX_PAGINAS_ADICIONALES,
  type LineaPresupuesto,
  type PresupuestoCalculado,
  type ServicioSeleccionado,
} from "@/lib/propuesta"

const TIPOS_WEB = ["landing", "corporativa"]

// Devuelve la selección limpia o la lista de errores
export function validarSeleccion(
  servicios: unknown
): { seleccion: ServicioSeleccionado[] } | { errores: string[] } {
  if (!Array.isArray(servicios) || servicios.length === 0) {
    return { errores: ["Selecciona al menos un servicio del catálogo"] }
  }

  const errores: string[] = []
  const seleccion: ServicioSeleccionado[] = []
  const vistos = new Set<string>()

  for (const elemento of servicios) {
    if (typeof elemento !== "object" || elemento === null) {
      errores.push("Cada servicio debe ser un objeto { id, cantidad }")
      continue
    }
    const { id, cantidad } = elemento as Record<string, unknown>

    if (!esIdDelCatalogo(id)) {
      errores.push(`El servicio «${String(id)}» no existe en el catálogo`)
      continue
    }
    if (vistos.has(id)) {
      errores.push(`El servicio «${id}» está repetido`)
      continue
    }
    vistos.add(id)

    const servicio = CATALOGO.find((s) => s.id === id)!
    if (servicio.regla === "porUnidad") {
      if (
        !Number.isInteger(cantidad) ||
        (cantidad as number) < 1 ||
        (cantidad as number) > MAX_PAGINAS_ADICIONALES
      ) {
        errores.push(
          `Indica cuántas unidades de «${servicio.nombre}» (número entero entre 1 y ${MAX_PAGINAS_ADICIONALES})`
        )
        continue
      }
      seleccion.push({ id, cantidad: cantidad as number })
    } else {
      // En los servicios de precio fijo la cantidad se ignora
      seleccion.push({ id, cantidad: null })
    }
  }

  const tipos = seleccion.filter((s) => TIPOS_WEB.includes(s.id))
  if (tipos.length === 0)
    errores.push("Elige un tipo de web: landing o corporativa")
  if (tipos.length > 1)
    errores.push("Solo se puede elegir un tipo de web: landing o corporativa")

  return errores.length > 0 ? { errores } : { seleccion }
}

// Función pura: recibe una selección ya validada y aplica las tarifas
export function calcularSeleccion(
  seleccion: ServicioSeleccionado[]
): PresupuestoCalculado {
  // Se ordena como el catálogo para que el desglose salga siempre igual
  const lineas: LineaPresupuesto[] = CATALOGO.filter((s) =>
    seleccion.some((sel) => sel.id === s.id)
  ).map((servicio) => {
    const cantidad =
      seleccion.find((sel) => sel.id === servicio.id)!.cantidad ?? 1
    return {
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      cantidad,
      precioUnitario: servicio.precio,
      importe: servicio.precio * cantidad,
    }
  })

  const total = lineas.reduce((suma, linea) => suma + linea.importe, 0)
  return { lineas, total, moneda: MONEDA }
}
