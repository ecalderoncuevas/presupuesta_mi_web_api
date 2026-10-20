import app from "./app.js"

// Puerto: el de la variable de entorno PORT o 3001 por defecto
const PORT = process.env.PORT || 3001

// En Express 5, si el puerto está ocupado el error llega a este callback
app.listen(PORT, (error) => {
  if (error) {
    console.error(`No se pudo arrancar la API en el puerto ${PORT}: ${error.message}`)
    process.exit(1)
  }
  console.log(`API escuchando en http://localhost:${PORT}`)
})
