// Catálogo de servicios de «Presupuesta mi web».
// Es la referencia que se envía a la IA: solo puede proponer servicios de esta lista.
// Los precios son los mismos que backend_API/src/tarifas.js (si cambias uno, cambia el otro).

export type IdServicio =
  "landing" | "corporativa" | "paginaAdicional" | "formulario" | "segundoIdioma"

export type Servicio = {
  id: IdServicio
  nombre: string
  descripcion: string
  precio: number
  // "fijo": se cobra una vez · "porUnidad": precio × cantidad (hay que indicar la cantidad)
  regla: "fijo" | "porUnidad"
}

export const CATALOGO: readonly Servicio[] = Object.freeze([
  {
    id: "landing",
    nombre: "Web tipo landing",
    descripcion:
      "Página única de presentación (producto, evento, negocio pequeño). Incluye diseño adaptable a móvil y la primera página.",
    precio: 300,
    regla: "fijo",
  },
  {
    id: "corporativa",
    nombre: "Web corporativa",
    descripcion:
      "Sitio de empresa con varias secciones (inicio, quiénes somos, servicios, contacto...). Incluye diseño adaptable y la primera página.",
    precio: 600,
    regla: "fijo",
  },
  {
    id: "paginaAdicional",
    nombre: "Página adicional",
    descripcion:
      "Cada página extra además de la primera (por ejemplo: carta, galería, blog, equipo). Se cobra por página.",
    precio: 50,
    regla: "porUnidad",
  },
  {
    id: "formulario",
    nombre: "Formulario de contacto",
    descripcion:
      "Formulario para que los visitantes envíen datos (contacto, solicitud de reserva, presupuesto). Los mensajes llegan por correo.",
    precio: 80,
    regla: "fijo",
  },
  {
    id: "segundoIdioma",
    nombre: "Segundo idioma",
    descripcion:
      "Versión completa de la web en un segundo idioma, con selector de idioma.",
    precio: 150,
    regla: "fijo",
  },
])

export const IDS_CATALOGO = CATALOGO.map((s) => s.id)

export const MONEDA = "EUR"

export function esIdDelCatalogo(id: unknown): id is IdServicio {
  return typeof id === "string" && (IDS_CATALOGO as string[]).includes(id)
}
