"use client"

import { useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"

import { EditorPresupuesto } from "@/components/dashboard/editor-presupuesto"
import { GraficoPresupuestos } from "@/components/dashboard/grafico-presupuestos"
import { PanelJson } from "@/components/dashboard/panel-json"
import { TablaPresupuestos } from "@/components/dashboard/tabla-presupuestos"
import { TarjetaTarifas } from "@/components/dashboard/tarjeta-tarifas"
import { TarjetasKpi } from "@/components/dashboard/tarjetas-kpi"
import { TickerTarifas } from "@/components/dashboard/ticker-tarifas"
import { UltimoPresupuesto } from "@/components/dashboard/ultimo-presupuesto"
import { Button } from "@/components/ui/button"
import { useApi } from "@/hooks/use-api"
import { ErrorApi, obtenerTarifas, pedirPresupuesto } from "@/lib/api"
import {
  BORRADOR_INICIAL,
  CASOS_INICIALES,
  aBorrador,
  aSolicitud,
  codigo,
  type Borrador,
  type Registro,
  type RespuestaApi,
} from "@/lib/presupuestos"

const transcurrido = (inicio: number) => Math.round(performance.now() - inicio)

export function PanelPresupuestos() {
  const { datos: tarifas, error: errorTarifas } = useApi(obtenerTarifas)

  const [registros, setRegistros] = useState<Registro[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorInicial, setErrorInicial] = useState<string | null>(null)
  const [borrador, setBorrador] = useState<Borrador>(BORRADOR_INICIAL)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [respuesta, setRespuesta] = useState<RespuestaApi | null>(null)
  // Último presupuesto creado o editado (se muestra en "Último presupuesto")
  const [ultimo, setUltimo] = useState<{ id: number; accion: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  const siguienteId = useRef(1)
  const editorRef = useRef<HTMLDivElement>(null)

  // Al abrir el panel, la API calcula los casos válidos 1 a 4 del enunciado
  useEffect(() => {
    let activo = true

    Promise.all(
      CASOS_INICIALES.map(async (solicitud) => ({
        solicitud,
        presupuesto: await pedirPresupuesto(solicitud),
      }))
    )
      .then((resultados) => {
        if (!activo) return
        const iniciales = resultados.map((resultado) => ({ id: siguienteId.current++, ...resultado }))
        setRegistros(iniciales)
        setUltimo({ id: iniciales[iniciales.length - 1].id, accion: "calculado al abrir el panel" })
        setCargando(false)
      })
      .catch((error: unknown) => {
        if (!activo) return
        setErrorInicial(error instanceof Error ? error.message : "Error desconocido")
        setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  function irAlEditor() {
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function nuevo() {
    setEditandoId(null)
    setBorrador(BORRADOR_INICIAL)
    irAlEditor()
  }

  function editar(id: number) {
    const registro = registros.find((actual) => actual.id === id)
    if (!registro) return
    setEditandoId(id)
    setBorrador(aBorrador(registro.solicitud))
    irAlEditor()
  }

  function cancelar() {
    setEditandoId(null)
    setBorrador(BORRADOR_INICIAL)
  }

  function eliminar(id: number) {
    setRegistros((actuales) => actuales.filter((registro) => registro.id !== id))
    if (editandoId === id) cancelar()
  }

  async function enviar() {
    // Solo se envían las características: nunca un precio ni un total
    const solicitud = aSolicitud(borrador)
    const idEditado = editandoId
    const inicio = performance.now()

    setEnviando(true)
    try {
      const presupuesto = await pedirPresupuesto(solicitud)
      let etiqueta: string

      if (idEditado !== null) {
        setRegistros((actuales) =>
          actuales.map((registro) =>
            registro.id === idEditado ? { ...registro, solicitud, presupuesto } : registro
          )
        )
        setEditandoId(null)
        etiqueta = `${codigo(idEditado)} actualizado`
        setUltimo({ id: idEditado, accion: "actualizado" })
      } else {
        const id = siguienteId.current++
        setRegistros((actuales) => [...actuales, { id, solicitud, presupuesto }])
        etiqueta = `${codigo(id)} creado`
        setUltimo({ id, accion: "creado" })
      }

      setRespuesta({ estado: 200, cuerpo: presupuesto, etiqueta, milisegundos: transcurrido(inicio) })
    } catch (error) {
      setRespuesta(
        error instanceof ErrorApi
          ? {
              estado: error.estado,
              cuerpo: { errores: error.errores },
              etiqueta: "solicitud rechazada",
              milisegundos: transcurrido(inicio),
            }
          : { estado: null, cuerpo: null, etiqueta: "sin conexión", milisegundos: transcurrido(inicio) }
      )
    } finally {
      setEnviando(false)
    }
  }

  // Si el último se ha eliminado, se muestra el más reciente que quede en la lista
  const registroUltimo =
    registros.find((registro) => registro.id === ultimo?.id) ?? registros.at(-1) ?? null

  return (
    <>
      <TickerTarifas tarifas={tarifas} error={errorTarifas} />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-medium tracking-[0.18em] uppercase md:text-3xl">
              Presupuestos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Calculados en tiempo real por la API con las tarifas del servidor.
            </p>
          </div>
          <Button size="lg" className="h-10 px-4" onClick={nuevo}>
            <Plus /> Nuevo presupuesto
          </Button>
        </div>

        <TarjetasKpi registros={registros} cargando={cargando} />

        <div className="grid gap-6 lg:grid-cols-3">
          <GraficoPresupuestos
            className="lg:col-span-2"
            registros={registros}
            cargando={cargando}
            onEditar={editar}
          />
          <TarjetaTarifas tarifas={tarifas} error={errorTarifas} />
        </div>

        <div ref={editorRef} className="grid scroll-mt-20 items-start gap-6 lg:grid-cols-2">
          <EditorPresupuesto
            borrador={borrador}
            onCambiar={setBorrador}
            onEnviar={enviar}
            onCancelar={cancelar}
            editandoId={editandoId}
            enviando={enviando}
            tarifas={tarifas}
          />
          <PanelJson solicitud={aSolicitud(borrador)} respuesta={respuesta} />
        </div>

        <UltimoPresupuesto
          registro={registroUltimo}
          accion={registroUltimo?.id === ultimo?.id ? (ultimo?.accion ?? "") : "último de la lista"}
          cargando={cargando}
          editando={registroUltimo !== null && editandoId === registroUltimo.id}
          onEditar={editar}
        />

        <TablaPresupuestos
          registros={registros}
          cargando={cargando}
          error={errorInicial}
          editandoId={editandoId}
          onEditar={editar}
          onEliminar={eliminar}
        />

        <footer className="flex flex-wrap justify-between gap-2 border-t pt-6 text-xs text-muted-foreground">
          <p>Waverly &amp; Hale · Proyecto académico 0613 · Desarrollo web en entorno servidor</p>
          <p className="font-mono">
            Tema: botón de la barra superior o tecla{" "}
            <kbd className="rounded border px-1.5 py-0.5">D</kbd>
          </p>
        </footer>
      </main>
    </>
  )
}
