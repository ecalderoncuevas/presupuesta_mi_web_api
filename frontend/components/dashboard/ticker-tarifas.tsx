import type { ClaveTarifa, RespuestaTarifas } from "@/lib/api"
import { CONCEPTOS, euros } from "@/lib/formato"

type TickerTarifasProps = {
  tarifas: RespuestaTarifas | null
  error: string | null
}

// Cinta tipo cotizaciones de bolsa con las tarifas de GET /api/tarifas.
// La clase "dark" fuerza la paleta oscura en la cinta con cualquier tema.
export function TickerTarifas({ tarifas, error }: TickerTarifasProps) {
  const claves = Object.keys(CONCEPTOS) as ClaveTarifa[]
  // Se repiten las tarifas para que cada mitad de la cinta llene pantallas anchas
  const fila = tarifas
    ? [...claves, ...claves].map((clave) => ({
        nombre: CONCEPTOS[clave].nombre.toUpperCase(),
        precio: euros(tarifas.tarifas[clave]),
      }))
    : []

  return (
    <div
      aria-label="Tarifas vigentes"
      className="dark overflow-hidden border-b border-border bg-card py-2.5 text-foreground"
    >
      {tarifas ? (
        <div className="animate-ticker flex w-max">
          {[0, 1].map((copia) => (
            <ul key={copia} aria-hidden={copia === 1} className="flex shrink-0">
              {fila.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-8 font-mono text-xs tracking-widest whitespace-nowrap"
                >
                  <span className="text-muted-foreground">{item.nombre}</span>
                  <span>{item.precio}</span>
                  <span className="text-gold" aria-hidden="true">▲</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p className="text-center font-mono text-xs tracking-widest text-muted-foreground">
          {error ? "COTIZACIONES NO DISPONIBLES · API SIN CONEXIÓN" : "CARGANDO TARIFAS…"}
        </p>
      )}
    </div>
  )
}
