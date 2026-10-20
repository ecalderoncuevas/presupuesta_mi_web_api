"use client"

import { Check, Pencil } from "lucide-react"

import { BloqueJson } from "@/components/dashboard/bloque-json"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CONCEPTOS, euros } from "@/lib/formato"
import { codigo, type Registro, type TipoWeb } from "@/lib/presupuestos"
import { cn } from "@/lib/utils"

const TIPOS: TipoWeb[] = ["landing", "corporativa"]
const EXTRAS = ["formulario", "segundoIdioma"] as const

type UltimoPresupuestoProps = {
  registro: Registro | null
  accion: string
  cargando: boolean
  editando: boolean
  onEditar: (id: number) => void
}

// El presupuesto más reciente (creado o editado) con su respuesta JSON.
// El resto se consulta en la tabla de presupuestos.
export function UltimoPresupuesto({
  registro,
  accion,
  cargando,
  editando,
  onEditar,
}: UltimoPresupuestoProps) {
  return (
    <section aria-labelledby="titulo-ultimo" className="flex flex-col gap-4">
      <div>
        <h2
          id="titulo-ultimo"
          className="font-heading text-lg font-medium tracking-[0.18em] uppercase"
        >
          Último presupuesto calculado por el servidor
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El más reciente creado o editado. Los demás están en la tabla de presupuestos.
        </p>
      </div>

      {cargando && <Skeleton className="h-96 w-full rounded-xl" />}

      {!cargando && !registro && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aún no hay presupuestos. Cree uno con «Nuevo presupuesto».
        </p>
      )}

      {registro && (
        <TarjetaUltimo registro={registro} accion={accion} editando={editando} onEditar={onEditar} />
      )}
    </section>
  )
}

type TarjetaUltimoProps = {
  registro: Registro
  accion: string
  editando: boolean
  onEditar: (id: number) => void
}

function TarjetaUltimo({ registro, accion, editando, onEditar }: TarjetaUltimoProps) {
  const { id, solicitud, presupuesto } = registro
  const adicionales = solicitud.paginas - 1
  const extras = EXTRAS.filter((extra) => solicitud[extra])

  return (
    <Card className={cn(editando && "ring-2 ring-gold")}>
      <CardHeader>
        <CardTitle>{codigo(id)}</CardTitle>
        <CardDescription>Calculado por el servidor · {accion}</CardDescription>
        <CardAction className="flex items-center gap-1">
          <span className="text-3xl font-semibold tracking-tight">{euros(presupuesto.total)}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${codigo(id)}`}
            onClick={() => onEditar(id)}
          >
            <Pencil />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <dl className="grid gap-6 md:grid-cols-[2fr_1fr_2fr]">
          <div>
            <dt className="text-xs text-muted-foreground">Tipo de web</dt>
            <dd className="mt-2 grid grid-cols-2 gap-2">
              {TIPOS.map((tipo) => {
                const activo = solicitud.tipo === tipo
                return (
                  <span
                    key={tipo}
                    aria-current={activo || undefined}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg border p-3 text-sm",
                      activo
                        ? "border-gold bg-accent/40 font-medium"
                        : "text-muted-foreground opacity-60"
                    )}
                  >
                    {CONCEPTOS[tipo].nombre}
                    {activo && <Check className="size-4 text-gold" aria-label="Seleccionado" />}
                  </span>
                )
              })}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">Páginas</dt>
            <dd className="mt-2">
              <span className="text-2xl font-semibold">{solicitud.paginas}</span>{" "}
              <span className="text-sm text-muted-foreground">
                ({adicionales} {adicionales === 1 ? "adicional" : "adicionales"})
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">Extras</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {extras.length === 0 ? (
                <span className="text-sm text-muted-foreground">Sin extras</span>
              ) : (
                extras.map((extra) => (
                  <Badge key={extra} variant="outline" className="h-7 gap-1 px-2.5">
                    <Check aria-hidden="true" />
                    {CONCEPTOS[extra].nombre} · {euros(presupuesto[extra])}
                  </Badge>
                ))
              )}
            </dd>
          </div>
        </dl>

        <div>
          <p className="mb-2 font-mono text-xs text-muted-foreground">
            Respuesta de <span className="text-foreground">POST</span> /api/presupuesto · 200 OK
          </p>
          <BloqueJson valor={presupuesto} />
        </div>
      </CardContent>
    </Card>
  )
}
