"use client"

import { useRef, useState } from "react"
import dynamic from "next/dynamic"
import { CircleAlert, FileText, PencilLine, RotateCcw } from "lucide-react"

import { FormularioSolicitud } from "@/components/asistente/formulario-solicitud"
import {
  RevisionServicios,
  type ServicioRevisado,
} from "@/components/asistente/revision-servicios"
import {
  TrazaAgente,
  type EstadoAgente,
} from "@/components/asistente/traza-agente"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ErrorAsistente,
  calcularPresupuesto,
  pedirPropuesta,
} from "@/lib/asistente"
import { euros } from "@/lib/formato"
import type { Propuesta, PresupuestoCalculado } from "@/lib/propuesta"

// @react-pdf/renderer solo funciona en el navegador: se carga sin renderizado en el servidor
const VistaPreviaPdf = dynamic(
  () => import("@/components/asistente/vista-previa-pdf"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[75vh] min-h-[480px] w-full" />,
  }
)

const mensajeDe = (error: unknown) =>
  error instanceof ErrorAsistente
    ? error.errores
    : ["Error inesperado. Inténtelo de nuevo."]

function irA(elemento: HTMLElement | null) {
  // Se espera al siguiente pintado para que la sección ya exista
  requestAnimationFrame(() =>
    elemento?.scrollIntoView({ behavior: "smooth", block: "start" })
  )
}

export function AsistentePresupuesto() {
  // 1. Solicitud
  const [cliente, setCliente] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [erroresSolicitud, setErroresSolicitud] = useState<string[]>([])

  // Agente
  const [agente, setAgente] = useState<EstadoAgente | null>(null)
  const [puedeReintentar, setPuedeReintentar] = useState(false)
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null)

  // 2. Revisión
  const [seleccion, setSeleccion] = useState<ServicioRevisado[]>([])
  const [resumen, setResumen] = useState("")

  // 3. Cálculo en el servidor y 4. PDF
  const [presupuesto, setPresupuesto] = useState<PresupuestoCalculado | null>(
    null
  )
  const [fecha, setFecha] = useState<Date | null>(null)
  const [calculando, setCalculando] = useState(false)
  const [erroresCalculo, setErroresCalculo] = useState<string[]>([])
  const [verPdf, setVerPdf] = useState(false)

  const refAgente = useRef<HTMLDivElement>(null)
  const refRevision = useRef<HTMLDivElement>(null)
  const refPresupuesto = useRef<HTMLDivElement>(null)
  const refPdf = useRef<HTMLDivElement>(null)

  const ejecutando = agente?.tipo === "ejecutando"

  async function pedir() {
    const texto = descripcion.trim()
    setErroresSolicitud([])
    setPropuesta(null)
    setPresupuesto(null)
    setVerPdf(false)
    setAgente({ tipo: "ejecutando", descripcion: texto || "(sin descripción)" })
    irA(refAgente.current)

    const inicio = performance.now()
    try {
      const nueva = await pedirPropuesta(cliente, descripcion)
      setPropuesta(nueva)
      setSeleccion(
        nueva.servicios.map((s) => ({
          id: s.id,
          justificacion: s.justificacion,
          cantidad: s.cantidad,
          origen: "asistente",
        }))
      )
      setResumen(nueva.resumen)
      setErroresCalculo([])
      setAgente({
        tipo: "completado",
        descripcion: texto,
        propuesta: nueva,
        milisegundos: performance.now() - inicio,
      })
      irA(refRevision.current)
    } catch (error) {
      // 400: datos del formulario incorrectos → se muestran junto a los campos
      if (error instanceof ErrorAsistente && error.estado === 400) {
        setAgente(null)
        setErroresSolicitud(error.errores)
        return
      }
      // Fallo de OpenAI o de conexión → se informa y se permite reintentar
      setAgente({
        tipo: "error",
        descripcion: texto,
        errores: mensajeDe(error),
      })
      setPuedeReintentar(
        error instanceof ErrorAsistente ? error.reintentar : true
      )
    }
  }

  // Cualquier cambio en la selección invalida el cálculo: el PDF siempre refleja la selección final
  function cambiarSeleccion(nueva: ServicioRevisado[]) {
    setSeleccion(nueva)
    setPresupuesto(null)
    setVerPdf(false)
    setErroresCalculo([])
  }

  function cambiarResumen(texto: string) {
    setResumen(texto)
    setVerPdf(false)
  }

  async function calcular() {
    setCalculando(true)
    setErroresCalculo([])
    try {
      const resultado = await calcularPresupuesto(
        seleccion.map(({ id, cantidad }) => ({ id, cantidad }))
      )
      setPresupuesto(resultado)
      setFecha(new Date())
      irA(refPresupuesto.current)
    } catch (error) {
      setErroresCalculo(mensajeDe(error))
    } finally {
      setCalculando(false)
    }
  }

  function reiniciar() {
    setCliente("")
    setDescripcion("")
    setErroresSolicitud([])
    setAgente(null)
    setPropuesta(null)
    setSeleccion([])
    setResumen("")
    setPresupuesto(null)
    setVerPdf(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium tracking-[0.18em] uppercase md:text-3xl">
            Asistente
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuéntenos su proyecto: la IA propone los servicios y el servidor
            calcula los importes.
          </p>
        </div>
        {(agente || propuesta) && (
          <Button
            variant="outline"
            size="lg"
            className="h-10 px-4"
            onClick={reiniciar}
          >
            <RotateCcw /> Nueva solicitud
          </Button>
        )}
      </div>

      <FormularioSolicitud
        cliente={cliente}
        descripcion={descripcion}
        onCambiar={(datos) => {
          setCliente(datos.cliente)
          setDescripcion(datos.descripcion)
        }}
        onEnviar={pedir}
        enviando={ejecutando}
        errores={erroresSolicitud}
      />

      {agente && (
        <div ref={refAgente} className="flex scroll-mt-20 flex-col gap-3">
          <TrazaAgente estado={agente} />
          {agente.tipo === "error" && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>No se ha podido obtener la propuesta</AlertTitle>
              <AlertDescription className="flex flex-col items-start gap-3">
                <span>{agente.errores.join(" · ")}</span>
                {puedeReintentar && (
                  <Button variant="outline" size="sm" onClick={pedir}>
                    <RotateCcw /> Volver a intentarlo
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {propuesta && (
        <div ref={refRevision} className="scroll-mt-20">
          <RevisionServicios
            seleccion={seleccion}
            onCambiarSeleccion={cambiarSeleccion}
            resumen={resumen}
            onCambiarResumen={cambiarResumen}
            aclaraciones={propuesta.aclaraciones}
            fueraDeCatalogo={propuesta.fueraDeCatalogo}
            onCalcular={calcular}
            calculando={calculando}
            erroresCalculo={erroresCalculo}
          />
        </div>
      )}

      {propuesta && presupuesto && (
        <div ref={refPresupuesto} className="scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle>3 · Presupuesto calculado por el servidor</CardTitle>
              <CardDescription>
                Importes de POST /api/calcular con las tarifas del servidor. Si
                cambia la selección, tendrá que volver a calcularlo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concepto</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead className="text-right">Precio unit.</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presupuesto.lineas.map((linea) => (
                      <TableRow key={linea.id}>
                        <TableCell>{linea.nombre}</TableCell>
                        <TableCell className="text-right font-mono">
                          {linea.cantidad}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {euros(linea.precioUnitario)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {euros(linea.importe)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-mono text-base font-semibold">
                        {euros(presupuesto.total)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              {!verPdf && (
                <Button
                  size="lg"
                  className="h-10 px-4"
                  onClick={() => {
                    setVerPdf(true)
                    irA(refPdf.current)
                  }}
                >
                  <FileText /> Revisar el PDF
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {propuesta && presupuesto && fecha && verPdf && (
        <div ref={refPdf} className="scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle>4 · Vista previa del PDF</CardTitle>
              <CardDescription>
                Revise el documento antes de descargarlo. Si algo no es
                correcto, vuelva a la revisión y cámbielo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <VistaPreviaPdf
                datos={{
                  cliente: propuesta.cliente,
                  fecha,
                  resumen,
                  presupuesto,
                  justificaciones: Object.fromEntries(
                    seleccion.map((s) => [s.id, s.justificacion])
                  ),
                  aclaraciones: propuesta.aclaraciones,
                  fueraDeCatalogo: propuesta.fueraDeCatalogo,
                }}
              />
              <Button
                variant="outline"
                size="lg"
                className="h-10 px-4"
                onClick={() => {
                  setVerPdf(false)
                  irA(refRevision.current)
                }}
              >
                <PencilLine /> Volver a la revisión
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}
