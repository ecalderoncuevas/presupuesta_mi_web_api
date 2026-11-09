"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const ENLACES = [
  { href: "/", texto: "Panel" },
  { href: "/asistente", texto: "Asistente IA" },
]

export function Navegacion() {
  const ruta = usePathname()

  return (
    <nav aria-label="Secciones" className="flex items-center gap-1">
      {ENLACES.map(({ href, texto }) => {
        const activo = ruta === href
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
              activo && "bg-muted text-foreground"
            )}
          >
            {texto}
          </Link>
        )
      })}
    </nav>
  )
}
