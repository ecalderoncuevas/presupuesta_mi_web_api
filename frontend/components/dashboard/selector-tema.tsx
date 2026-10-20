"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

// Alterna entre modo claro y oscuro. Los dos iconos se muestran con CSS (clase "dark"),
// así el servidor y el navegador pintan lo mismo y no hay errores de hidratación.
export function SelectorTema() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon-lg"
      title="Cambiar entre modo claro y oscuro (tecla D)"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
      <span className="sr-only">Cambiar entre modo claro y oscuro</span>
    </Button>
  )
}
