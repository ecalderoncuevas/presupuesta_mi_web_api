import app from "./app.js"

// Puerto: el de la variable de entorno PORT o 3001 por defecto
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`)
})
