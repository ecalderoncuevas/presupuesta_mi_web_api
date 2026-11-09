"use client"

import { LoaderCircle, Sparkles } from "lucide-react"

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
import { MAX_CLIENTE, MAX_DESCRIPCION } from "@/lib/propuesta"
import { cn } from "@/lib/utils"

// Datos ficticios para las pruebas del apartado 6 del enunciado
const EJEMPLOS = [
  {
    etiqueta: "Solicitud clara",
    cliente: "Restaurante El Olivo Ficticio",
    descripcion:
      "Necesito una web para un restaurante. Quiero mostrar la carta, tener un formulario para solicitar reservas y ofrecer el contenido en dos idiomas.",
  },
  {
    etiqueta: "Solicitud ambigua",
    cliente: "Estudio Lumen (ficticio)",
    descripcion:
      "Quiero algo bonito en internet para que me conozca más gente.",
  },
  {
    etiqueta: "Fuera de catálogo",
    cliente: "Moda Ficticia SL",
    descripcion:
      "Quiero una tienda online para vender ropa con pasarela de pago, área de clientes y un formulario de contacto.",
  },
]

type FormularioSolicitudProps = {
  cliente: string
  descripcion: string
  onCambiar: (datos: { cliente: string; descripcion: string }) => void
  onEnviar: () => void
  enviando: boolean
  // Errores de validación devueltos por el servidor (400)
  errores: string[]
}

export function FormularioSolicitud({
  cliente,
  descripcion,
  onCambiar,
  onEnviar,
  enviando,
  errores,
}: FormularioSolicitudProps) {
  const errorCliente = errores.find((e) => e.toLowerCase().includes("cliente"))
  const errorDescripcion = errores.find((e) =>
    e.toLowerCase().includes("descripción")
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>1 · Solicitud del cliente</CardTitle>
        <CardDescription>
          Explique qué necesita con sus palabras. El asistente propondrá
          servicios de nuestro catálogo y usted podrá revisarlos antes de
          calcular el presupuesto.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          noValidate
          onSubmit={(evento) => {
            evento.preventDefault()
            onEnviar()
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="cliente">Cliente o empresa</Label>
            <Input
              id="cliente"
              value={cliente}
              maxLength={MAX_CLIENTE}
              placeholder="Ej.: Restaurante El Olivo"
              aria-invalid={errorCliente ? true : undefined}
              aria-describedby={errorCliente ? "error-cliente" : undefined}
              onChange={(e) =>
                onCambiar({ cliente: e.target.value, descripcion })
              }
            />
            {errorCliente && (
              <p id="error-cliente" className="text-xs text-destructive">
                {errorCliente}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="descripcion">Descripción del proyecto</Label>
            <textarea
              id="descripcion"
              rows={5}
              value={descripcion}
              maxLength={MAX_DESCRIPCION}
              placeholder="Ej.: Necesito una web para mi restaurante con la carta, un formulario de reservas y en dos idiomas."
              aria-invalid={errorDescripcion ? true : undefined}
              aria-describedby="ayuda-descripcion"
              onChange={(e) =>
                onCambiar({ cliente, descripcion: e.target.value })
              }
              className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
            />
            <div
              id="ayuda-descripcion"
              className="flex justify-between gap-4 text-xs"
            >
              <span className="text-destructive">{errorDescripcion}</span>
              <span
                className={cn(
                  "shrink-0 font-mono text-muted-foreground",
                  descripcion.length > MAX_DESCRIPCION * 0.9 && "text-gold"
                )}
              >
                {descripcion.length} / {MAX_DESCRIPCION}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
              Probar con datos ficticios:
            </span>
            <div className="flex flex-wrap gap-2">
              {EJEMPLOS.map((ejemplo) => (
                <Button
                  key={ejemplo.etiqueta}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCambiar({
                      cliente: ejemplo.cliente,
                      descripcion: ejemplo.descripcion,
                    })
                  }
                >
                  {ejemplo.etiqueta}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onCambiar({ cliente: "Cliente de prueba", descripcion: "" })
                }
              >
                Descripción vacía
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={enviando}
            className="h-10 px-4"
          >
            {enviando ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            {enviando
              ? "El asistente está preparando la propuesta…"
              : "Pedir propuesta al asistente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
