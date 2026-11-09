"use client"

import {
  Bot,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  FileJson,
  HelpCircle,
  LoaderCircle,
  PackageX,
  ShieldCheck,
} from "lucide-react"

import { BloqueJson } from "@/components/dashboard/bloque-json"
import { Badge } from "@/components/ui/badge"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace"
import { CATALOGO } from "@/lib/catalogo"
import type { Propuesta } from "@/lib/propuesta"

export type EstadoAgente =
  | { tipo: "ejecutando"; descripcion: string }
  | { tipo: "error"; descripcion: string; errores: string[] }
  | {
      tipo: "completado"
      descripcion: string
      propuesta: Propuesta
      milisegundos: number
    }

// Componente "Subagent" de shadcn AI Elements (construido sobre Trace):
// una línea plegable con la tarea, los pasos que ha dado el agente y su resultado.
export function TrazaAgente({ estado }: { estado: EstadoAgente }) {
  const { tipo, descripcion } = estado

  const titulo =
    tipo === "ejecutando"
      ? "Ejecutando el agente de propuestas…"
      : tipo === "error"
        ? "El agente de propuestas no ha podido terminar"
        : "Ejecutó el agente de propuestas"

  return (
    <Trace className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine
            status={
              tipo === "ejecutando"
                ? "running"
                : tipo === "error"
                  ? "error"
                  : undefined
            }
          >
            <TraceIcon>
              {tipo === "ejecutando" && (
                <LoaderCircle className="animate-spin" />
              )}
              {tipo === "error" && <CircleAlert />}
              {tipo === "completado" && (
                <CircleCheck className="text-success" />
              )}
            </TraceIcon>
            <TraceTitle className="font-medium">{titulo}</TraceTitle>
            {tipo === "completado" && (
              <TraceDescription>
                {(estado.milisegundos / 1000).toLocaleString("es-ES", {
                  maximumFractionDigits: 1,
                })}{" "}
                s
              </TraceDescription>
            )}
          </TraceLine>
        </TraceCollapsibleTrigger>

        <TraceCollapsibleContent keepMounted className="flex flex-col gap-4">
          {/* Tarea que recibe el agente */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium tracking-wide text-foreground uppercase">
              Tarea
            </span>
            <p className="line-clamp-4 text-sm italic">«{descripcion}»</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline">
                <Bot />{" "}
                {tipo === "completado" ? estado.propuesta.modelo : "OpenAI"}
              </Badge>
              <Badge variant="outline">
                Catálogo · {CATALOGO.length} servicios
              </Badge>
              <Badge variant="outline">Salida JSON estructurada</Badge>
            </div>
          </div>

          {/* Pasos */}
          <Trace>
            {tipo === "ejecutando" && <PasosEnCurso />}
            {tipo === "error" && (
              <TraceLine status="error">
                <TraceIcon>
                  <CircleAlert />
                </TraceIcon>
                <TraceTitle className="whitespace-normal">
                  {estado.errores.join(" · ")}
                </TraceTitle>
              </TraceLine>
            )}
            {tipo === "completado" && (
              <PasosCompletados propuesta={estado.propuesta} />
            )}
          </Trace>

          {/* Resultado */}
          {tipo === "completado" && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide text-foreground uppercase">
                  Resultado
                </span>
                <p className="text-sm text-foreground">
                  {estado.propuesta.resumen}
                </p>
              </div>

              <TraceCollapsible>
                <TraceCollapsibleTrigger>
                  <TraceLine>
                    <TraceIcon>
                      <FileJson />
                    </TraceIcon>
                    <TraceTitle>
                      Respuesta JSON validada por el servidor
                    </TraceTitle>
                  </TraceLine>
                </TraceCollapsibleTrigger>
                <TraceCollapsibleContent>
                  <BloqueJson valor={estado.propuesta} />
                </TraceCollapsibleContent>
              </TraceCollapsible>
            </>
          )}
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}

function PasosEnCurso() {
  return (
    <>
      <TraceLine status="running">
        <TraceIcon>
          <LoaderCircle className="animate-spin" />
        </TraceIcon>
        <TraceTitle>Enviando la descripción y el catálogo a OpenAI</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceIcon>
          <CircleDashed />
        </TraceIcon>
        <TraceTitle>
          Validar los servicios propuestos contra el catálogo
        </TraceTitle>
      </TraceLine>
    </>
  )
}

function PasosCompletados({ propuesta }: { propuesta: Propuesta }) {
  const { servicios, descartados, aclaraciones, fueraDeCatalogo } = propuesta

  return (
    <>
      <TraceLine>
        <TraceIcon>
          <CircleCheck />
        </TraceIcon>
        <TraceTitle>
          Propuso {servicios.length}{" "}
          {servicios.length === 1 ? "servicio" : "servicios"} del catálogo
        </TraceTitle>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <ShieldCheck />
        </TraceIcon>
        <TraceTitle>
          Servidor: identificadores validados
          {descartados.length > 0
            ? ` (${descartados.length} descartados)`
            : ", ninguno descartado"}
        </TraceTitle>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <HelpCircle />
        </TraceIcon>
        <TraceTitle>
          {aclaraciones.length === 0
            ? "Sin dudas pendientes"
            : `${aclaraciones.length} ${aclaraciones.length === 1 ? "duda" : "dudas"} para aclarar con el cliente`}
        </TraceTitle>
      </TraceLine>
      {fueraDeCatalogo.length > 0 && (
        <TraceLine>
          <TraceIcon>
            <PackageX />
          </TraceIcon>
          <TraceTitle>
            {fueraDeCatalogo.length}{" "}
            {fueraDeCatalogo.length === 1 ? "necesidad" : "necesidades"} fuera
            del catálogo
          </TraceTitle>
        </TraceLine>
      )}
    </>
  )
}
