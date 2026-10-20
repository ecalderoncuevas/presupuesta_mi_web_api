"use client"

import { LoaderCircle, Minus, Plus } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import type { RespuestaTarifas } from "@/lib/api"
import { CONCEPTOS, euros } from "@/lib/formato"
import { codigo, type Borrador, type TipoWeb } from "@/lib/presupuestos"

const TIPOS: TipoWeb[] = ["landing", "corporativa"]
const EXTRAS = ["formulario", "segundoIdioma"] as const

type EditorPresupuestoProps = {
  borrador: Borrador
  onCambiar: (borrador: Borrador) => void
  onEnviar: () => void
  onCancelar: () => void
  editandoId: number | null
  enviando: boolean
  tarifas: RespuestaTarifas | null
}

export function EditorPresupuesto({
  borrador,
  onCambiar,
  onEnviar,
  onCancelar,
  editandoId,
  enviando,
  tarifas,
}: EditorPresupuestoProps) {
  const editando = editandoId !== null

  function cambiarPaginas(cambio: number) {
    const actual = Math.round(Number(borrador.paginas) || 0)
    onCambiar({ ...borrador, paginas: String(Math.min(20, Math.max(1, actual + cambio))) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editando ? `Editando ${codigo(editandoId)}` : "Nuevo presupuesto"}
        </CardTitle>
        <CardDescription>
          Solo se envían las características. El precio lo calcula el servidor.
        </CardDescription>
        {editando && (
          <CardAction>
            <Badge variant="outline" className="border-gold/60 text-gold">
              Modo edición
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <form
          noValidate
          onSubmit={(evento) => {
            evento.preventDefault()
            onEnviar()
          }}
          className="flex flex-col gap-6"
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">Tipo de web</legend>
            <RadioGroup
              value={borrador.tipo}
              onValueChange={(valor) => onCambiar({ ...borrador, tipo: valor as TipoWeb })}
              className="grid grid-cols-2 gap-3"
            >
              {TIPOS.map((tipo) => (
                <Label
                  key={tipo}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-data-checked:border-gold has-data-checked:bg-accent/40"
                >
                  <span className="flex flex-col gap-1">
                    <span>{CONCEPTOS[tipo].nombre}</span>
                    {tarifas && (
                      <span className="font-mono text-xs font-normal text-muted-foreground">
                        {euros(tarifas.tarifas[tipo])}
                      </span>
                    )}
                  </span>
                  <RadioGroupItem value={tipo} />
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="paginas">Número de páginas</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label="Quitar una página"
                onClick={() => cambiarPaginas(-1)}
              >
                <Minus />
              </Button>
              <Input
                id="paginas"
                type="number"
                inputMode="decimal"
                min={1}
                max={20}
                value={borrador.paginas}
                onChange={(evento) => onCambiar({ ...borrador, paginas: evento.target.value })}
                aria-describedby="ayuda-paginas"
                className="h-9 w-24 text-center font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label="Añadir una página"
                onClick={() => cambiarPaginas(1)}
              >
                <Plus />
              </Button>
            </div>
            <p id="ayuda-paginas" className="text-xs leading-relaxed text-muted-foreground">
              Entre 1 y 20; la primera va incluida en el precio base. Escriba 0, 21 o 2,5 para
              ver cómo responde el servidor.
            </p>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">Extras</legend>
            {EXTRAS.map((extra) => (
              <label
                key={extra}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <span className="text-sm">{CONCEPTOS[extra].nombre}</span>
                <span className="flex items-center gap-3">
                  {tarifas && (
                    <span className="font-mono text-xs text-muted-foreground">
                      +{euros(tarifas.tarifas[extra])}
                    </span>
                  )}
                  <Switch
                    checked={borrador[extra]}
                    onCheckedChange={(activo) => onCambiar({ ...borrador, [extra]: activo })}
                  />
                </span>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="lg" disabled={enviando} className="h-10 flex-1 px-4">
              {enviando && <LoaderCircle className="animate-spin" />}
              {enviando ? "Calculando…" : editando ? "Guardar cambios" : "Calcular presupuesto"}
            </Button>
            {editando && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-10 px-4"
                onClick={onCancelar}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
