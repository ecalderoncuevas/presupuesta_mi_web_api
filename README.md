# Presupuesta mi web · API

API REST que calcula presupuestos desglosados para proyectos web a partir de sus características. El servidor valida los datos recibidos y calcula el precio **con sus propias tarifas**: nunca acepta precios ni totales enviados por el cliente.

> Actividad **0613 · Desarrollo web en entorno servidor** · RA7 · CE 7.4 y 7.6

**Tecnologías:** Node.js · Express 5 · JavaScript (módulos ES)

---

## Requisitos

- [Node.js](https://nodejs.org/) **18 o superior** (probado con Node.js v25.9.0)
- npm (incluido con Node.js)

Para comprobar la versión instalada:

```bash
node -v
```

---

## Instalación

```bash
git clone https://github.com/ecalderoncuevas/presupuesta_mi_web_api.git
cd presupuesta_mi_web_api/backend_API
npm install
```

`npm install` instala las dependencias declaradas en `backend_API/package.json` (`express` y `cors`).

## Ejecución

Desde la carpeta `backend_API/`:

```bash
npm start
```

Modo desarrollo (se reinicia automáticamente al guardar cambios):

```bash
npm run dev
```

Al arrancar se muestra:

```
API escuchando en http://localhost:3001
```

## Puerto

La API escucha por defecto en el puerto **3001**: **http://localhost:3001**

Se puede cambiar con la variable de entorno `PORT`:

```bash
# PowerShell
$env:PORT=4000; npm start

# Bash
PORT=4000 npm start
```

---

## Rutas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/estado` | Confirma que el servicio funciona |
| `GET` | `/api/tarifas` | Devuelve las tarifas que utiliza el servidor |
| `POST` | `/api/presupuesto` | Valida una solicitud y devuelve el presupuesto desglosado |

### `GET /api/estado`

Respuesta `200`:

```json
{
  "status": "ok"
}
```

### `GET /api/tarifas`

Respuesta `200`:

```json
{
  "tarifas": {
    "landing": 300,
    "corporativa": 600,
    "paginaAdicional": 50,
    "formulario": 80,
    "segundoIdioma": 150
  },
  "moneda": "EUR"
}
```

| Concepto | Clave | Precio |
|---|---|---:|
| Landing, incluida la primera página | `landing` | 300 € |
| Web corporativa, incluida la primera página | `corporativa` | 600 € |
| Cada página adicional a la primera | `paginaAdicional` | 50 € |
| Formulario de contacto | `formulario` | 80 € |
| Segundo idioma | `segundoIdioma` | 150 € |

### `POST /api/presupuesto`

Requiere la cabecera `Content-Type: application/json` y un cuerpo con estos cuatro campos obligatorios:

| Campo | Tipo | Valores válidos |
|---|---|---|
| `tipo` | string | `"landing"` o `"corporativa"` |
| `paginas` | number | Entero entre 1 y 20 |
| `formulario` | boolean | `true` o `false` |
| `segundoIdioma` | boolean | `true` o `false` |

Las cadenas `"4"` o `"false"` **no** son válidas: los tipos deben ser exactos. Las propiedades adicionales (por ejemplo, `total` o `base`) se ignoran.

**Ejemplo de solicitud:**

```json
{
  "tipo": "corporativa",
  "paginas": 4,
  "formulario": true,
  "segundoIdioma": false
}
```

**Respuesta `200`:**

```json
{
  "base": 600,
  "paginasAdicionales": 150,
  "formulario": 80,
  "segundoIdioma": 0,
  "total": 830,
  "moneda": "EUR"
}
```

`paginasAdicionales` es el **coste** de las páginas extra: (4 − 1) × 50 € = 150 €.

**Respuesta `400`** (solicitud incorrecta, no se calcula el presupuesto):

```json
{
  "errores": ["paginas debe ser un número entero entre 1 y 20"]
}
```

**Ejemplo con curl:**

```bash
curl -X POST http://localhost:3001/api/presupuesto \
  -H "Content-Type: application/json" \
  -d '{"tipo":"corporativa","paginas":4,"formulario":true,"segundoIdioma":false}'
```

**Ejemplo con PowerShell:**

```powershell
$body = '{"tipo":"corporativa","paginas":4,"formulario":true,"segundoIdioma":false}'
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/presupuesto -ContentType "application/json" -Body $body
```

### Códigos de estado

| Código | Cuándo |
|---|---|
| `200` | Petición correcta |
| `400` | Cuerpo que no es un objeto, faltan campos, tipos o valores incorrectos, JSON mal formado o sin `Content-Type: application/json` |
| `404` | Ruta inexistente |
| `500` | Error interno inesperado |

Todos los errores se devuelven en JSON con el formato `{ "errores": [ ... ] }`.

---

## Funcionamiento

### Validación (`src/validacion.js`)

`validarSolicitud(body)` devuelve un array con todos los errores encontrados (vacío si la solicitud es válida):

1. El cuerpo debe ser un objeto (ni `null`, ni array, ni ausente).
2. Deben existir los cuatro campos (`Object.hasOwn`).
3. `tipo` debe estar en `["landing", "corporativa"]`.
4. `paginas` debe cumplir `Number.isInteger(paginas)` y estar entre 1 y 20 (rechaza `"4"`, `2.5`, `0` y `21`).
5. `formulario` y `segundoIdioma` deben ser de tipo `boolean` (rechaza `"false"`).

### Cálculo (`src/calculo.js`)

`calcularPresupuesto({ tipo, paginas, formulario, segundoIdioma })` es una función independiente del manejador de la ruta. Recibe los datos ya validados y aplica:

```
Total = precio base + páginas adicionales + extras seleccionados
```

| Concepto | Cálculo |
|---|---|
| `base` | `TARIFAS[tipo]` |
| `paginasAdicionales` | `(paginas − 1) × TARIFAS.paginaAdicional` |
| `formulario` | `TARIFAS.formulario` si es `true`, si no `0` |
| `segundoIdioma` | `TARIFAS.segundoIdioma` si es `true`, si no `0` |

### Control de las tarifas

- Las tarifas están definidas en `src/tarifas.js` y congeladas con `Object.freeze`.
- El cálculo solo lee precios de ese módulo.
- La ruta pasa a la función de cálculo **únicamente** los cuatro campos validados, por lo que cualquier propiedad extra enviada por el cliente (`total`, `base`, precios…) no tiene efecto.
- Los presupuestos no se guardan en ninguna base de datos.

---

## Estructura del proyecto

```
presupuesta_mi_web_api/
├── README.md
├── backend_API/              ← API (Express)
│   ├── package.json
│   ├── package-lock.json
│   ├── pruebas.http          ← peticiones de prueba (REST Client)
│   └── src/
│       ├── server.js         ← arranca el servidor en el puerto
│       ├── app.js            ← configuración de Express y rutas
│       ├── tarifas.js        ← tarifas del servidor
│       ├── validacion.js     ← validación de solicitudes
│       └── calculo.js        ← función de cálculo del presupuesto
└── frontend/                 ← interfaz web (Next.js, ampliación en desarrollo)
```

---

## Pruebas

Las peticiones están en [`backend_API/pruebas.http`](backend_API/pruebas.http) y se pueden ejecutar con la extensión **REST Client** de VS Code (botón *Send Request* sobre cada `###`), con el servidor arrancado.

### Rutas GET

| Ruta | Resultado esperado | Resultado obtenido |
|---|---|---|
| `GET /api/estado` | 200 · `{ "status": "ok" }` | 200 · `{"status":"ok"}` ✅ |
| `GET /api/tarifas` | 200 · Las 5 tarifas y la moneda | 200 · `landing: 300`, `corporativa: 600`, `paginaAdicional: 50`, `formulario: 80`, `segundoIdioma: 150`, `moneda: "EUR"` ✅ |

### POST /api/presupuesto

| Caso | Solicitud | Resultado esperado | Resultado obtenido |
|:---:|---|---|---|
| 1 | `{ "tipo": "landing", "paginas": 1, "formulario": false, "segundoIdioma": false }` | 200 · Total: 300 € | 200 · base 300 + páginas 0 + formulario 0 + idioma 0 = **300 €** ✅ |
| 2 | `{ "tipo": "corporativa", "paginas": 4, "formulario": true, "segundoIdioma": false }` | 200 · Total: 830 € | 200 · base 600 + páginas 150 + formulario 80 + idioma 0 = **830 €** ✅ |
| 3 | `{ "tipo": "landing", "paginas": 2, "formulario": true, "segundoIdioma": true }` | 200 · Total: 580 € | 200 · base 300 + páginas 50 + formulario 80 + idioma 150 = **580 €** ✅ |
| 4 | `{ "tipo": "landing", "paginas": 20, "formulario": false, "segundoIdioma": false }` | 200 · Total: 1.250 € | 200 · base 300 + páginas 950 + formulario 0 + idioma 0 = **1.250 €** ✅ |
| 5 | `{ "tipo": "landing", "paginas": 0, "formulario": false, "segundoIdioma": false }` | 400 | 400 · `paginas debe ser un número entero entre 1 y 20` ✅ |
| 6 | `{ "tipo": "landing", "paginas": 21, "formulario": false, "segundoIdioma": false }` | 400 | 400 · `paginas debe ser un número entero entre 1 y 20` ✅ |
| 7 | `{ "tipo": "landing", "paginas": 2.5, "formulario": false, "segundoIdioma": false }` | 400 | 400 · `paginas debe ser un número entero entre 1 y 20` ✅ |
| 8 | `{ "tipo": "tienda", "paginas": 1, "formulario": false, "segundoIdioma": false }` | 400 | 400 · `tipo debe ser 'landing' o 'corporativa'` ✅ |
| 9 | `{ "tipo": "landing", "paginas": 1, "formulario": "false", "segundoIdioma": false }` | 400 | 400 · `formulario debe ser un booleano (true o false)` ✅ |

### Pruebas adicionales

| Caso | Solicitud | Resultado esperado | Resultado obtenido |
|:---:|---|---|---|
| A | `"paginas": "4"` (cadena), resto correcto | 400 | 400 · `paginas debe ser un número entero entre 1 y 20` ✅ |
| B | `{}` | 400 | 400 · Los 4 errores `Falta el campo obligatorio: ...` ✅ |
| C | Caso 2 + `"total": 1, "base": 0` | 200 · Total: 830 € (se ignoran) | 200 · **830 €**, los campos extra no afectan ✅ |
| D | `{ "tipo": "landing",` (JSON mal formado) | 400 | 400 · `El cuerpo de la petición no es un JSON válido` ✅ |
| E | Body válido sin `Content-Type: application/json` | 400 | 400 · `El cuerpo de la petición debe ser un objeto JSON` ✅ |
