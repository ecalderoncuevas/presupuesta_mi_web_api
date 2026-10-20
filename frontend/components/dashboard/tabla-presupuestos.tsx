"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CONCEPTOS, euros } from "@/lib/formato"
import { codigo, type Registro } from "@/lib/presupuestos"
import { cn } from "@/lib/utils"

// Columnas del desglose con la misma muestra de color que el gráfico
const COLUMNAS = [
  { clave: "base", titulo: "Base", color: "bg-chart-1" },
  { clave: "paginasAdicionales", titulo: "Págs. adicionales", color: "bg-chart-2" },
  { clave: "formulario", titulo: "Formulario", color: "bg-chart-3" },
  { clave: "segundoIdioma", titulo: "Segundo idioma", color: "bg-chart-4" },
] as const

type TablaPresupuestosProps = {
  registros: Registro[]
  cargando: boolean
  error: string | null
  editandoId: number | null
  onEditar: (id: number) => void
  onEliminar: (id: number) => void
}

export function TablaPresupuestos({
  registros,
  cargando,
  error,
  editandoId,
  onEditar,
  onEliminar,
}: TablaPresupuestosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuestos</CardTitle>
        <CardDescription>
          Respuestas de <code className="font-mono">POST /api/presupuesto</code>. Al editar uno,
          el servidor lo vuelve a calcular.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Páginas</TableHead>
              {COLUMNAS.map((columna) => (
                <TableHead key={columna.clave} className="text-right">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-[2px]", columna.color)} aria-hidden="true" />
                    {columna.titulo}
                  </span>
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando &&
              [0, 1, 2, 3].map((fila) => (
                <TableRow key={fila}>
                  <TableCell colSpan={10}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!cargando && registros.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                  {error
                    ? "No se pudo conectar con la API para calcular los presupuestos."
                    : "No hay presupuestos. Cree uno con «Nuevo presupuesto»."}
                </TableCell>
              </TableRow>
            )}

            {registros.map(({ id, solicitud, presupuesto }) => (
              <TableRow key={id} className={cn(editandoId === id && "bg-accent/40 hover:bg-accent/40")}>
                <TableCell className="font-mono text-xs">{codigo(id)}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    {CONCEPTOS[solicitud.tipo].nombre}
                    {editandoId === id && (
                      <Badge variant="outline" className="border-gold/60 text-gold">
                        Editando
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{solicitud.paginas}</TableCell>
                {COLUMNAS.map((columna) => (
                  <TableCell key={columna.clave} className="text-right font-mono tabular-nums">
                    {euros(presupuesto[columna.clave])}
                  </TableCell>
                ))}
                <TableCell className="text-right font-mono font-semibold tabular-nums">
                  {euros(presupuesto.total)}
                </TableCell>
                <TableCell>
                  <span className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${codigo(id)}`}
                      onClick={() => onEditar(id)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Eliminar ${codigo(id)}`}
                      onClick={() => onEliminar(id)}
                      className="hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
