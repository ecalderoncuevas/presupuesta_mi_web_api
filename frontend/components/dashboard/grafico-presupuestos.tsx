"use client"

import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { euros } from "@/lib/formato"
import { codigo, resumen, type Registro } from "@/lib/presupuestos"

// Orden de apilado: de abajo (base) arriba. Los colores son los tokens --chart-1..4,
// una paleta validada para daltonismo y contraste en tema claro y oscuro.
const SERIES = ["base", "paginasAdicionales", "formulario", "segundoIdioma"] as const
type Serie = (typeof SERIES)[number]

const configGrafico = {
  base: { label: "Precio base", color: "var(--chart-1)" },
  paginasAdicionales: { label: "Páginas adicionales", color: "var(--chart-2)" },
  formulario: { label: "Formulario", color: "var(--chart-3)" },
  segundoIdioma: { label: "Segundo idioma", color: "var(--chart-4)" },
} satisfies ChartConfig

type DatoGrafico = Record<Serie, number> & {
  id: number
  codigo: string
  resumen: string
  // Serie superior con importe: es la única que lleva las esquinas redondeadas
  tope: Serie
}

type PropsSegmento = {
  x: number
  y: number
  width: number
  height: number
  fill: string
  payload: DatoGrafico
}

const HUECO = 2

// Segmento apilado: 2px de hueco con el de debajo y esquinas de 4px solo arriba del todo
function formaSegmento(serie: Serie) {
  return function Segmento(props: unknown) {
    const { x, y, width, height, fill, payload } = props as PropsSegmento
    const alto = serie === "base" ? height : height - HUECO
    if (alto <= 0) return <g />
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={alto}
        fill={fill}
        radius={payload.tope === serie ? [4, 4, 0, 0] : 0}
      />
    )
  }
}

const formatoEje = (valor: number) =>
  valor >= 1000 ? `${(valor / 1000).toLocaleString("es-ES")}K €` : `${valor} €`

// Marcas redondas del eje Y: de 250 en 250 hasta 1000 € y de 500 en 500 a partir de ahí
function marcasEje(maximo: number) {
  const paso = maximo > 1000 ? 500 : 250
  const techo = Math.max(paso, Math.ceil(maximo / paso) * paso)
  return Array.from({ length: techo / paso + 1 }, (_, i) => i * paso)
}

type GraficoPresupuestosProps = {
  registros: Registro[]
  cargando: boolean
  onEditar: (id: number) => void
  className?: string
}

export function GraficoPresupuestos({
  registros,
  cargando,
  onEditar,
  className,
}: GraficoPresupuestosProps) {
  const datos: DatoGrafico[] = registros.map(({ id, solicitud, presupuesto }) => ({
    id,
    codigo: codigo(id),
    resumen: resumen(solicitud),
    base: presupuesto.base,
    paginasAdicionales: presupuesto.paginasAdicionales,
    formulario: presupuesto.formulario,
    segundoIdioma: presupuesto.segundoIdioma,
    tope: SERIES.findLast((serie) => presupuesto[serie] > 0) ?? "base",
  }))
  const marcas = marcasEje(Math.max(0, ...registros.map((registro) => registro.presupuesto.total)))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Desglose por presupuesto</CardTitle>
        <CardDescription>
          Cada columna suma el precio base, las páginas adicionales y los extras.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <Skeleton className="h-75 w-full" />
        ) : datos.length === 0 ? (
          <p className="flex h-75 items-center justify-center text-sm text-muted-foreground">
            No hay presupuestos que mostrar.
          </p>
        ) : (
          <ChartContainer config={configGrafico} className="aspect-auto h-75 w-full">
            <BarChart accessibilityLayer data={datos} margin={{ top: 8, left: 4, right: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="codigo" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                ticks={marcas}
                domain={[0, marcas[marcas.length - 1]]}
                tickFormatter={formatoEje}
                className="tabular-nums"
              />
              <ChartTooltip
                cursor={{ fillOpacity: 0.5 }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(_, carga) => {
                      const dato = carga?.[0]?.payload as DatoGrafico | undefined
                      return dato ? `${dato.codigo} · ${dato.resumen}` : null
                    }}
                    formatter={(valor, nombre) => (
                      <div className="flex w-full items-center gap-2">
                        <span
                          className="h-3 w-1 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: `var(--color-${nombre})` }}
                        />
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {euros(Number(valor))}
                        </span>
                        <span className="ml-auto pl-4 text-muted-foreground">
                          {configGrafico[nombre as Serie]?.label}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
              {SERIES.map((serie) => (
                <Bar
                  key={serie}
                  dataKey={serie}
                  stackId="presupuesto"
                  fill={`var(--color-${serie})`}
                  maxBarSize={24}
                  shape={formaSegmento(serie)}
                  className="cursor-pointer"
                  onClick={(dato) => onEditar((dato.payload as DatoGrafico).id)}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Pulse una columna para editar ese presupuesto. Todos los valores están también en la
        tabla inferior.
      </CardFooter>
    </Card>
  )
}
