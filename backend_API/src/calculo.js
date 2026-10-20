import { TARIFAS, MONEDA } from "./tarifas.js"

// Calcula el presupuesto a partir de datos ya validados.
// Función pura: no depende de req/res y solo usa las tarifas del servidor.
export function calcularPresupuesto({ tipo, paginas, formulario, segundoIdioma }) {
  const base = TARIFAS[tipo] // La base incluye la primera página
  const paginasAdicionales = (paginas - 1) * TARIFAS.paginaAdicional
  const costeFormulario = formulario ? TARIFAS.formulario : 0
  const costeSegundoIdioma = segundoIdioma ? TARIFAS.segundoIdioma : 0

  const total = base + paginasAdicionales + costeFormulario + costeSegundoIdioma

  return {
    base,
    paginasAdicionales,
    formulario: costeFormulario,
    segundoIdioma: costeSegundoIdioma,
    total,
    moneda: MONEDA,
  }
}
