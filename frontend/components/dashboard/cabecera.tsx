import { EstadoServicio } from "@/components/dashboard/estado-servicio"
import { SelectorTema } from "@/components/dashboard/selector-tema"

export function Cabecera() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 md:px-6">
        <span className="font-heading text-sm font-medium tracking-[0.25em] uppercase">
          Waverly &amp; Hale
        </span>
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">Panel de presupuestos</span>
        <div className="ml-auto flex items-center gap-3">
          <EstadoServicio />
          <SelectorTema />
        </div>
      </div>
    </header>
  )
}
