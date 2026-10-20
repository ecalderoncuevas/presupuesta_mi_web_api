import { CircleAlert, CircleCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SolicitudPresupuesto } from "@/lib/api"
import type { RespuestaApi } from "@/lib/presupuestos"
import { cn } from "@/lib/utils"

// Separa claves, cadenas, números y booleanos para colorear el JSON
const TOKENS_JSON = /("(?:\\.|[^"\\])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

function claseToken(token: string) {
  if (token.endsWith(":")) return "text-foreground"
  if (token.startsWith('"')) return "text-success"
  if (/^(true|false|null)$/.test(token)) return "text-accent-foreground"
  return "text-gold"
}

function BloqueJson({ valor }: { valor: unknown }) {
  const partes = JSON.stringify(valor, null, 2).split(TOKENS_JSON)
  return (
    <pre className="dark overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-xs leading-relaxed text-muted-foreground">
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <span key={i} className={claseToken(parte)}>
            {parte}
          </span>
        ) : (
          parte
        )
      )}
    </pre>
  )
}

function EstadoHttp({ estado }: { estado: number | null }) {
  if (estado === null) {
    return (
      <Badge variant="destructive" className="gap-1">
        <CircleAlert /> Sin respuesta
      </Badge>
    )
  }
  const correcto = estado >= 200 && estado < 300
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-mono", correcto ? "border-success/50 text-success" : "border-destructive/50 text-destructive")}
    >
      {correcto ? <CircleCheck /> : <CircleAlert />}
      {estado} {correcto ? "OK" : "Bad Request"}
    </Badge>
  )
}

type PanelJsonProps = {
  solicitud: SolicitudPresupuesto
  respuesta: RespuestaApi | null
}

export function PanelJson({ solicitud, respuesta }: PanelJsonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Respuesta JSON</CardTitle>
        <CardDescription>Lo que envía el formulario y lo que devuelve la API.</CardDescription>
        {respuesta && (
          <CardAction>
            <EstadoHttp estado={respuesta.estado} />
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <section aria-label="Solicitud">
          <p className="mb-2 flex flex-wrap justify-between gap-2 font-mono text-xs text-muted-foreground">
            <span>
              <span className="text-foreground">POST</span> /api/presupuesto
            </span>
            <span>Content-Type: application/json</span>
          </p>
          <BloqueJson valor={solicitud} />
        </section>

        <section aria-label="Respuesta" aria-live="polite">
          <p className="mb-2 flex flex-wrap justify-between gap-2 font-mono text-xs text-muted-foreground">
            <span>
              <span className="text-foreground">Respuesta</span>
              {respuesta && ` · ${respuesta.etiqueta}`}
            </span>
            {respuesta && <span>{respuesta.milisegundos} ms</span>}
          </p>
          {respuesta ? (
            respuesta.estado === null ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                No se pudo conectar con la API. ¿Está arrancada en el puerto 3001?
              </p>
            ) : (
              <BloqueJson valor={respuesta.cuerpo} />
            )
          ) : (
            <pre className="dark rounded-lg border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
              {"// Pulse «Calcular presupuesto» para ver la respuesta del servidor"}
            </pre>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
