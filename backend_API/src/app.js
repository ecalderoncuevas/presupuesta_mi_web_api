import express from "express"
import cors from "cors"
import { TARIFAS, MONEDA } from "./tarifas.js"
import { validarSolicitud } from "./validacion.js"
import { calcularPresupuesto } from "./calculo.js"


// Crea la aplicación Express
const app = express()

// Middlewares
app.use(cors()) // Permite peticiones desde el frontend (otro puerto)
app.use(express.json()) // Convierte el body JSON en req.body

// GET /api/estado → confirma que el servicio funciona
app.get("/api/estado", (req, res) => {
  res.json({ status: "ok" })
})

// GET /api/tarifas → devuelve las tarifas que usa el servidor
app.get("/api/tarifas", (req, res) => {
  res.json({ tarifas: TARIFAS, moneda: MONEDA })
})

// POST /api/presupuesto → valida la solicitud (el cálculo llega en la Fase 6)
// POST /api/presupuesto → valida la solicitud y devuelve el presupuesto desglosado
app.post("/api/presupuesto", (req, res) => {
  const errores = validarSolicitud(req.body)

  // Si la solicitud es incorrecta: 400 y no se calcula nada
  if (errores.length > 0) {
    return res.status(400).json({ errores })
  }

  // Solo se pasan los 4 campos: las propiedades extra (p. ej. "total") se ignoran
  const { tipo, paginas, formulario, segundoIdioma } = req.body
  const presupuesto = calcularPresupuesto({ tipo, paginas, formulario, segundoIdioma })

  res.status(200).json(presupuesto)
})


// Ruta no encontrada → 404 en JSON
app.use((req, res) => {
  res.status(404).json({ errores: ["Ruta no encontrada"] })
})

// Manejador de errores (4 parámetros): JSON mal formado → 400, resto → 500
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ errores: ["El cuerpo de la petición no es un JSON válido"] })
  }
  console.error(err)
  res.status(500).json({ errores: ["Error interno del servidor"] })
})


export default app
