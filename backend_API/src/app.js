import express from "express"
import cors from "cors"
import { TARIFAS, MONEDA } from "./tarifas.js"

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

export default app
