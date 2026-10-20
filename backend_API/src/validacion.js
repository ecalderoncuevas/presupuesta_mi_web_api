const CAMPOS_OBLIGATORIOS = ["tipo", "paginas", "formulario", "segundoIdioma"]
const TIPOS_VALIDOS = ["landing", "corporativa"]

// Valida el cuerpo de una solicitud de presupuesto.
// Devuelve un array de mensajes de error (vacío si la solicitud es válida).
export function validarSolicitud(body) {
  const errores = []

  // ① El cuerpo debe ser un objeto (ni null, ni array, ni undefined)
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return ["El cuerpo de la petición debe ser un objeto JSON"]
  }

  // ② Deben estar los cuatro campos obligatorios
  for (const campo of CAMPOS_OBLIGATORIOS) {
    if (!Object.hasOwn(body, campo)) {
      errores.push(`Falta el campo obligatorio: ${campo}`)
    }
  }
  if (errores.length > 0) return errores

  const { tipo, paginas, formulario, segundoIdioma } = body

  // ③ tipo: "landing" o "corporativa"
  if (!TIPOS_VALIDOS.includes(tipo)) {
    errores.push("tipo debe ser 'landing' o 'corporativa'")
  }

  // ④ paginas: número entero entre 1 y 20 ("4" y 2.5 no son válidos)
  if (!Number.isInteger(paginas) || paginas < 1 || paginas > 20) {
    errores.push("paginas debe ser un número entero entre 1 y 20")
  }

  // ⑤ formulario y segundoIdioma: booleanos ("false" no es válido)
  if (typeof formulario !== "boolean") {
    errores.push("formulario debe ser un booleano (true o false)")
  }
  if (typeof segundoIdioma !== "boolean") {
    errores.push("segundoIdioma debe ser un booleano (true o false)")
  }

  return errores
}
