"use client"

import { Badge } from "@/components/ui/badge"
import { useApi } from "@/hooks/use-api"
import { obtenerEstado } from "@/lib/api"
import { cn } from "@/lib/utils"

// Indicador en vivo de GET /api/estado
export function EstadoServicio() {
  const { datos, cargando } = useApi(obtenerEstado)
  const operativa = datos?.status === "ok"

  const texto = cargando
    ? "Comprobando API…"
    : operativa
      ? "API operativa"
      : "API no disponible"

  return (
    <Badge variant="outline" className="h-7 gap-2 px-3 font-normal" aria-live="polite">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          cargando && "animate-pulse bg-muted-foreground",
          !cargando && (operativa ? "bg-success" : "bg-destructive")
        )}
      />
      {texto}
    </Badge>
  )
}
