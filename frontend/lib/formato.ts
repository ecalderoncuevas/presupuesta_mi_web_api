import type { ClaveTarifa } from "@/lib/api"

const formatoEuros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  // En es-ES los números de 4 cifras no llevan punto por defecto: así se ve "1.250 €"
  useGrouping: "always",
})

export function euros(cantidad: number) {
  return formatoEuros.format(cantidad)
}

// Textos de presentación de cada tarifa. Los precios siempre llegan de la API.
export const CONCEPTOS: Record<ClaveTarifa, { nombre: string; detalle: string }> = {
  landing: {
    nombre: "Landing",
    detalle: "Una página para presentar un producto o campaña. Incluye la primera página.",
  },
  corporativa: {
    nombre: "Web corporativa",
    detalle: "La presencia completa de su empresa. Incluye la primera página.",
  },
  paginaAdicional: {
    nombre: "Página adicional",
    detalle: "Cada página a partir de la primera, hasta un máximo de 20.",
  },
  formulario: {
    nombre: "Formulario de contacto",
    detalle: "Para que sus clientes le escriban sin salir de la web.",
  },
  segundoIdioma: {
    nombre: "Segundo idioma",
    detalle: "Todo el contenido disponible en una segunda lengua.",
  },
}
