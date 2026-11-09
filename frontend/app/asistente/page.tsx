import type { Metadata } from "next"

import { AsistentePresupuesto } from "@/components/asistente/asistente-presupuesto"
import { Cabecera } from "@/components/dashboard/cabecera"

export const metadata: Metadata = {
  title: "Waverly & Hale · Asistente de presupuestos",
  description:
    "Describa su proyecto y reciba una propuesta de servicios, revísela y descargue el presupuesto en PDF.",
}

export default function PaginaAsistente() {
  return (
    <>
      <Cabecera />
      <AsistentePresupuesto />
    </>
  )
}
