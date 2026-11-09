"use client"

import {
  Calculator,
  CircleAlert,
  HelpCircle,
  LoaderCircle,
  Minus,
  PackageX,
  Plus,
  Trash2,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CATALOGO, type IdServicio } from "@/lib/catalogo"
import { MAX_PAGINAS_ADICIONALES } from "@/lib/propuesta"

export type ServicioRevisado = {
  id: IdServicio
  justificacion: string
  cantidad: number | null
  origen: "asistente" | "usuario"
}

const TIPOS_WEB: IdServicio[] = ["landing", "corporativa"]
const servicioDe = (id: IdServicio) => CATALOGO.find((s) => s.id === id)!

// Datos que faltan para poder calcular (el servidor vuelve a comprobarlo)
export function pendientesDe(seleccion: ServicioRevisado[]) {
  const pendientes: string[] = []
  if (!seleccion.some((s) => TIPOS_WEB.includes(s.id))) {
    pendientes.push(
      "Elija un tipo de web (landing o corporativa) en «Añadir del catálogo»."
    )
  }
  for (const s of seleccion) {
    const servicio = servicioDe(s.id)
    if (
      servicio.regla === "porUnidad" &&
      (s.cantidad === null ||
        s.cantidad < 1 ||
        s.cantidad > MAX_PAGINAS_ADICIONALES)
    ) {
      pendientes.push(
        `Indique cuántas unidades de «${servicio.nombre}» (entre 1 y ${MAX_PAGINAS_ADICIONALES}).`
      )
    }
  }
  return pendientes
}

type RevisionServiciosProps = {
  seleccion: ServicioRevisado[]
  onCambiarSeleccion: (seleccion: ServicioRevisado[]) => void
  resumen: string
  onCambiarResumen: (resumen: string) => void
  aclaraciones: string[]
  fueraDeCatalogo: string[]
  onCalcular: () => void
  calculando: boolean
  erroresCalculo: string[]
}

export function RevisionServicios({
  seleccion,
  onCambiarSeleccion,
  resumen,
  onCambiarResumen,
  aclaraciones,
  fueraDeCatalogo,
  onCalcular,
  calculando,
  erroresCalculo,
}: RevisionServiciosProps) {
  const pendientes = pendientesDe(seleccion)
  const disponibles = CATALOGO.filter(
    (s) => !seleccion.some((sel) => sel.id === s.id)
  )
  const tipoActual = seleccion.find((s) => TIPOS_WEB.includes(s.id))

  function quitar(id: IdServicio) {
    onCambiarSeleccion(seleccion.filter((s) => s.id !== id))
  }

  function anadir(id: IdServicio) {
    const nuevo: ServicioRevisado = {
      id,
      justificacion: "Añadido manualmente durante la revisión.",
      cantidad: servicioDe(id).regla === "porUnidad" ? 1 : null,
      origen: "usuario",
    }
    // Solo puede haber un tipo de web: el nuevo sustituye al anterior
    const resto = TIPOS_WEB.includes(id)
      ? seleccion.filter((s) => !TIPOS_WEB.includes(s.id))
      : seleccion
    onCambiarSeleccion([...resto, nuevo])
  }

  function cambiarCantidad(id: IdServicio, cantidad: number | null) {
    onCambiarSeleccion(
      seleccion.map((s) => (s.id === id ? { ...s, cantidad } : s))
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>2 · Revise la propuesta</CardTitle>
        <CardDescription>
          Acepte, quite o añada servicios del catálogo. Los importes los calcula
          el servidor con nuestras tarifas cuando confirme la selección.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Resumen editable: es el que aparecerá en el PDF */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="resumen">Resumen del proyecto</Label>
          <textarea
            id="resumen"
            rows={3}
            value={resumen}
            maxLength={1000}
            onChange={(e) => onCambiarResumen(e.target.value)}
            className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          />
        </div>

        {/* Servicios seleccionados */}
        <section
          className="flex flex-col gap-3"
          aria-labelledby="titulo-seleccion"
        >
          <h3 id="titulo-seleccion" className="text-sm font-medium">
            Servicios seleccionados ({seleccion.length})
          </h3>
          {seleccion.length === 0 && (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No hay servicios seleccionados. Añádalos desde el catálogo.
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {seleccion.map((s) => {
              const servicio = servicioDe(s.id)
              const faltaCantidad =
                servicio.regla === "porUnidad" &&
                (s.cantidad === null ||
                  s.cantidad < 1 ||
                  s.cantidad > MAX_PAGINAS_ADICIONALES)
              return (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{servicio.nombre}</span>
                      <Badge
                        variant={
                          s.origen === "asistente" ? "secondary" : "outline"
                        }
                      >
                        {s.origen === "asistente"
                          ? "Propuesto por el asistente"
                          : "Añadido por usted"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {servicio.descripcion}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Por qué: </span>
                      {s.justificacion}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-start gap-2">
                    {servicio.regla === "porUnidad" && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Una unidad menos"
                            onClick={() =>
                              cambiarCantidad(
                                s.id,
                                Math.max(1, (s.cantidad ?? 1) - 1)
                              )
                            }
                          >
                            <Minus />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            max={MAX_PAGINAS_ADICIONALES}
                            aria-label={`Cantidad de ${servicio.nombre}`}
                            aria-invalid={faltaCantidad ? true : undefined}
                            value={s.cantidad ?? ""}
                            placeholder="?"
                            onChange={(e) =>
                              cambiarCantidad(
                                s.id,
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                            className="w-16 text-center font-mono"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Una unidad más"
                            onClick={() =>
                              cambiarCantidad(
                                s.id,
                                Math.min(
                                  MAX_PAGINAS_ADICIONALES,
                                  (s.cantidad ?? 0) + 1
                                )
                              )
                            }
                          >
                            <Plus />
                          </Button>
                        </div>
                        {faltaCantidad && (
                          <span className="text-xs text-destructive">
                            Dato obligatorio
                          </span>
                        )}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Quitar ${servicio.nombre}`}
                      onClick={() => quitar(s.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Catálogo para añadir */}
        {disponibles.length > 0 && (
          <section
            className="flex flex-col gap-3"
            aria-labelledby="titulo-catalogo"
          >
            <h3 id="titulo-catalogo" className="text-sm font-medium">
              Añadir del catálogo
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {disponibles.map((servicio) => (
                <li
                  key={servicio.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-dashed p-3"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm font-medium">
                      {servicio.nombre}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {servicio.descripcion}
                    </span>
                    {tipoActual && TIPOS_WEB.includes(servicio.id) && (
                      <span className="text-xs text-gold">
                        Sustituirá a «{servicioDe(tipoActual.id).nombre}»
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => anadir(servicio.id)}
                  >
                    <Plus /> Añadir
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Dudas y necesidades fuera del catálogo: también irán en el PDF */}
        {(aclaraciones.length > 0 || fueraDeCatalogo.length > 0) && (
          <>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              {aclaraciones.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <HelpCircle className="size-4 text-gold" /> Aspectos a
                    aclarar
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {aclaraciones.map((texto) => (
                      <li key={texto}>{texto}</li>
                    ))}
                  </ul>
                </section>
              )}
              {fueraDeCatalogo.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <PackageX className="size-4 text-gold" /> Pendiente de
                    valorar (fuera del catálogo)
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {fueraDeCatalogo.map((texto) => (
                      <li key={texto}>{texto}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    No se incluye en el total: se valorará aparte.
                  </p>
                </section>
              )}
            </div>
          </>
        )}

        {pendientes.length > 0 && (
          <Alert>
            <CircleAlert />
            <AlertTitle>Antes de continuar</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {pendientes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {erroresCalculo.length > 0 && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>
              El servidor no ha podido calcular el presupuesto
            </AlertTitle>
            <AlertDescription>{erroresCalculo.join(" · ")}</AlertDescription>
          </Alert>
        )}

        <Button
          type="button"
          size="lg"
          className="h-10 px-4"
          disabled={pendientes.length > 0 || calculando}
          onClick={onCalcular}
        >
          {calculando ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Calculator />
          )}
          {calculando ? "Calculando…" : "Confirmar selección y calcular"}
        </Button>
      </CardContent>
    </Card>
  )
}
