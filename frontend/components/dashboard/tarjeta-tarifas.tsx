import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ClaveTarifa, RespuestaTarifas } from "@/lib/api"
import { CONCEPTOS, euros } from "@/lib/formato"

type TarjetaTarifasProps = {
  tarifas: RespuestaTarifas | null
  error: string | null
  className?: string
}

const CLAVES = Object.keys(CONCEPTOS) as ClaveTarifa[]

export function TarjetaTarifas({ tarifas, error, className }: TarjetaTarifasProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tarifas del servidor</CardTitle>
        <CardDescription>
          <code className="font-mono">GET /api/tarifas</code> · sin impuestos ni descuentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            No se pudo conectar con la API. Arranque el backend con{" "}
            <code className="font-mono">npm run dev</code> en{" "}
            <code className="font-mono">backend_API</code>.
          </p>
        )}
        <ul className="divide-y">
          {CLAVES.map((clave) => (
            <li key={clave} className="flex items-baseline justify-between gap-4 py-3">
              <span>
                <span className="block text-sm font-medium">{CONCEPTOS[clave].nombre}</span>
                <span className="block text-xs text-muted-foreground">
                  {clave === "landing" || clave === "corporativa"
                    ? "Precio base · incluye la 1.ª página"
                    : clave === "paginaAdicional"
                      ? "Por página, de la 2.ª a la 20.ª"
                      : "Extra opcional"}
                </span>
              </span>
              {tarifas ? (
                <span className="font-mono text-sm tabular-nums">
                  {euros(tarifas.tarifas[clave])}
                </span>
              ) : (
                !error && <Skeleton className="h-4 w-14" />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
