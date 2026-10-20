# Presupuesta mi web

API REST que calcula presupuestos desglosados para proyectos web a partir de sus características. El servidor valida los datos recibidos y calcula el precio **con sus propias tarifas**: nunca acepta precios ni totales enviados por el cliente.

Incluye además un **dashboard web** (ampliación opcional) que consume la API: crea y edita presupuestos, los muestra en un gráfico y enseña la respuesta JSON del servidor.

> Actividad **0613 · Desarrollo web en entorno servidor** · RA7 · CE 7.4, 7.6 y 7.7

| Parte | Carpeta | Tecnologías |
|---|---|---|
| **API** (obligatoria) | `backend_API/` | Node.js · Express 5 · JavaScript (módulos ES) |
| **Dashboard** (ampliación) | `frontend/` | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Recharts · React Bits |

---

## Puesta en marcha rápida

### Requisitos

- [Node.js](https://nodejs.org/) **20.9 o superior** (probado con Node.js v25.9.0). La API funciona desde Node 18, pero el dashboard (Next.js 16) necesita 20.9 o superior.
- npm (incluido con Node.js) y Git.
- Conexión a internet la primera vez (para `npm install` y para descargar las fuentes del dashboard).

```bash
node -v
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/ecalderoncuevas/presupuesta_mi_web_api.git
cd presupuesta_mi_web_api
```

### 2. Arrancar la API (terminal 1)

```bash
cd backend_API
npm install
npm start
```

Debe aparecer:

```
API escuchando en http://localhost:3001
```

Comprobación: abrir **http://localhost:3001/api/estado** en el navegador → `{"status":"ok"}`.

### 3. Arrancar el dashboard (terminal 2, ampliación)

Con la API en marcha, en **otra** terminal desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

Abrir **http://localhost:3000**. El indicador de la barra superior debe decir **«API operativa»** y el panel carga automáticamente los casos 1 a 4 del enunciado calculados por la API.

> Las dos terminales deben quedar abiertas. Si se abre el dashboard antes de arrancar la API, basta con arrancarla y recargar la página.

### Resumen

| Parte | Carpeta | Instalar | Arrancar | URL |
|---|---|---|---|---|
| API | `backend_API/` | `npm install` | `npm start` | http://localhost:3001 |
| Dashboard | `frontend/` | `npm install` | `npm run dev` | http://localhost:3000 |

### Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| El dashboard no arranca y pide una versión de Node mayor | Next.js 16 requiere Node **20.9+**. Instalar la versión LTS de Node.js. |
| `Error: listen EADDRINUSE :::3001` | El puerto 3001 está ocupado por otro programa. Cerrarlo o usar otro puerto (ver [Cambiar los puertos](#cambiar-los-puertos)). |
| El dashboard muestra **«API no disponible»** | La API no está arrancada (terminal 1). Arrancarla con `npm start` y recargar la página. |
| PowerShell: *«npm.ps1 no se puede cargar porque la ejecución de scripts está deshabilitada»* | Ejecutar `Set-ExecutionPolicy -Scope Process Bypass` en esa ventana (solo afecta a esa terminal) o usar CMD / Git Bash. |
| El puerto 3000 está ocupado | Next.js usa automáticamente el siguiente libre: abrir la URL que muestra la terminal. |
| `npm install` en `frontend/` avisa de vulnerabilidades | Proceden de dependencias del CLI de shadcn (herramienta de desarrollo para añadir componentes). No afectan a la API ni al dashboard. **No** ejecutar `npm audit fix --force`, que cambia versiones y puede romper el proyecto. |

### Cambiar los puertos

La API usa la variable de entorno `PORT` (por defecto `3001`). Si se cambia, hay que indicar al dashboard la nueva URL con `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:3001`):

```powershell
# PowerShell · terminal 1
cd backend_API
$env:PORT=4000; npm start

# PowerShell · terminal 2
cd frontend
$env:NEXT_PUBLIC_API_URL="http://localhost:4000"; npm run dev
```

```bash
# Bash
cd backend_API && PORT=4000 npm start
cd frontend && NEXT_PUBLIC_API_URL=http://localhost:4000 npm run dev
```

### Otros comandos

| Carpeta | Comando | Qué hace |
|---|---|---|
| `backend_API/` | `npm run dev` | API en modo desarrollo: se reinicia al guardar cambios |
| `frontend/` | `npm run build` y después `npm start` | Dashboard compilado en modo producción (puerto 3000) |

---

## Rutas de la API

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

## Funcionamiento de la API

### Validación (`backend_API/src/validacion.js`)

`validarSolicitud(body)` devuelve un array con todos los errores encontrados (vacío si la solicitud es válida):

1. El cuerpo debe ser un objeto (ni `null`, ni array, ni ausente).
2. Deben existir los cuatro campos (`Object.hasOwn`).
3. `tipo` debe estar en `["landing", "corporativa"]`.
4. `paginas` debe cumplir `Number.isInteger(paginas)` y estar entre 1 y 20 (rechaza `"4"`, `2.5`, `0` y `21`).
5. `formulario` y `segundoIdioma` deben ser de tipo `boolean` (rechaza `"false"`).

### Cálculo (`backend_API/src/calculo.js`)

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

- Las tarifas están definidas en `backend_API/src/tarifas.js` y congeladas con `Object.freeze`.
- El cálculo solo lee precios de ese módulo.
- La ruta pasa a la función de cálculo **únicamente** los cuatro campos validados, por lo que cualquier propiedad extra enviada por el cliente (`total`, `base`, precios…) no tiene efecto.
- Los presupuestos no se guardan en ninguna base de datos.

---

## Dashboard (ampliación)

Interfaz React que consume la API. Todo lo que muestra procede del servidor:

- **Indicador de estado** de la API (`GET /api/estado`) y **cinta de tarifas** (`GET /api/tarifas`).
- **Indicadores**: número de presupuestos, importe acumulado, presupuesto medio y mayor presupuesto.
- **Gráfico de columnas apiladas** con el desglose de cada presupuesto (base, páginas adicionales y extras). Al pulsar una columna se edita ese presupuesto.
- **Editor** para crear un presupuesto nuevo o editar uno existente, con la **respuesta JSON** al lado: el cuerpo que se envía y lo que devuelve el servidor, con su código HTTP (200 o 400).
- **Último presupuesto calculado**: tipo de web, páginas, extras y su respuesta JSON.
- **Tabla de presupuestos** con el desglose completo y botones para editar y eliminar.
- Botón para cambiar entre **modo claro y oscuro** (también con la tecla `D`).

Cómo consume el servicio:

- Todas las llamadas están en `frontend/lib/api.ts`.
- El formulario envía **solo** `tipo`, `paginas`, `formulario` y `segundoIdioma`; nunca precios ni totales.
- No valida en el cliente: los errores que se muestran son los que devuelve la API (por ejemplo, al escribir 21 o 2,5 páginas aparece el `400` del servidor).
- Los presupuestos solo viven en memoria durante la sesión: al recargar la página se pierden (no hay base de datos).

---

## Estructura del proyecto

```
presupuesta_mi_web_api/
├── README.md
├── backend_API/                  ← API (Express)
│   ├── package.json
│   ├── package-lock.json
│   ├── pruebas.http              ← peticiones de prueba (REST Client)
│   └── src/
│       ├── server.js             ← arranca el servidor en el puerto
│       ├── app.js                ← configuración de Express y rutas
│       ├── tarifas.js            ← tarifas del servidor
│       ├── validacion.js         ← validación de solicitudes
│       └── calculo.js            ← función de cálculo del presupuesto
└── frontend/                     ← dashboard (Next.js)
    ├── package.json
    ├── package-lock.json
    ├── app/                      ← página, layout y estilos globales
    ├── components/
    │   ├── dashboard/            ← secciones del dashboard
    │   └── ui/                   ← componentes de shadcn/ui
    ├── hooks/use-api.ts          ← peticiones a la API desde los componentes
    └── lib/
        ├── api.ts                ← cliente de la API (todas las llamadas)
        ├── formato.ts            ← formato de euros y textos de las tarifas
        └── presupuestos.ts       ← tipos y utilidades del dashboard
```

---

## Pruebas

Las peticiones están en [`backend_API/pruebas.http`](backend_API/pruebas.http) y se pueden ejecutar con la extensión **REST Client** de VS Code (botón *Send Request* sobre cada `###`), con la API arrancada.

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
| F | `GET /api/loquesea` (ruta inexistente) | 404 | 404 · `Ruta no encontrada` ✅ |

### Dashboard

| Prueba | Resultado esperado | Resultado obtenido |
|---|---|---|
| Abrir el dashboard con la API arrancada | «API operativa», tarifas y casos 1–4 cargados | P-001 300 €, P-002 830 €, P-003 580 €, P-004 1.250 € ✅ |
| Crear un presupuesto (corporativa, 4 páginas, formulario) | 200 y nuevo presupuesto en tabla, gráfico y JSON | `200 OK` · P-005 · 830 € ✅ |
| Editar P-002 (8 páginas + segundo idioma) | El servidor lo recalcula | 600 + 350 + 80 + 150 = **1.180 €** ✅ |
| Enviar 21 páginas desde el editor | 400 con el mensaje del servidor, sin crear nada | `400 Bad Request` · `paginas debe ser un número entero entre 1 y 20` ✅ |
| Abrir el dashboard con la API apagada | Aviso claro, sin errores | «API no disponible» y mensajes en la cinta, las tarifas y la tabla ✅ |
