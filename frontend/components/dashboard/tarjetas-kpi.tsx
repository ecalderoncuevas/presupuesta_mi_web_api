"use client"

import CountUp from "@/components/CountUp"
import SpotlightCard from "@/components/SpotlightCard"
import { Skeleton } from "@/components/ui/skeleton"
import { codigo, resumen, type Registro } from "@/lib/presupuestos"

type TarjetasKpiProps = {
  registros: Registro[]
  cargando: boolean
}

// Integra la SpotlightCard de React Bits con la paleta del tema
const estiloTarjeta = {
  "--spotlight-card-surface": "var(--card)",
  "--spotlight-card-border": "var(--border)",
  "--spotlight-card-shadow": "none",
} as React.CSSProperties

export function TarjetasKpi({ registros, cargando }: TarjetasKpiProps) {
  const totales = registros.map((registro) => registro.presupuesto.total)
  const acumulado = totales.reduce((suma, total) => suma + total, 0)
  const mayor = registros.reduce<Registro | null>(
    (max, registro) =>
      !max || registro.presupuesto.total > max.presupuesto.total ? registro : max,
    null
  )

  const tarjetas = [
    {
      etiqueta: "Presupuestos en la sesión",
      valor: registros.length,
      sufijo: "",
      nota: "Sin base de datos: se pierden al recargar",
    },
    {
      etiqueta: "Importe acumulado",
      valor: acumulado,
      sufijo: " €",
      nota: "Suma de todos los totales",
    },
    {
      etiqueta: "Presupuesto medio",
      valor: registros.length ? Math.round(acumulado / registros.length) : 0,
      sufijo: " €",
      nota: "Media redondeada al euro",
    },
    {
      etiqueta: "Mayor presupuesto",
      valor: mayor?.presupuesto.total ?? 0,
      sufijo: " €",
      nota: mayor ? `${codigo(mayor.id)} · ${resumen(mayor.solicitud)}` : "—",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tarjetas.map((tarjeta) => (
        <SpotlightCard
          key={tarjeta.etiqueta}
          theme="light"
          spotlightColor="var(--gold)"
          intensity={0.6}
          style={estiloTarjeta}
          className="flex flex-col gap-3 rounded-xl! p-5!"
        >
          <p className="text-sm text-muted-foreground">{tarjeta.etiqueta}</p>
          {cargando ? (
            <Skeleton className="h-9 w-28" />
          ) : (
            <p className="text-3xl font-semibold tracking-tight">
              <CountUp
                to={tarjeta.valor}
                suffix={tarjeta.sufijo}
                separator="."
                duration={1}
                style={{ fontVariantNumeric: "normal" }}
              />
            </p>
          )}
          <p className="truncate text-xs text-muted-foreground">{tarjeta.nota}</p>
        </SpotlightCard>
      ))}
    </div>
  )
}
