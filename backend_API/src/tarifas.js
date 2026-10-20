// Tarifas del servidor: única fuente de verdad para los precios.
// Object.freeze impide que se modifiquen mientras el servidor está en marcha.
export const TARIFAS = Object.freeze({
  landing: 300, 
  corporativa: 600,
  paginaAdicional: 50,
  formulario: 80, 
  segundoIdioma: 150,
})

export const MONEDA = "EUR"
