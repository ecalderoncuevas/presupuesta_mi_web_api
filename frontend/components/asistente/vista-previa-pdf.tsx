"use client"

// Vista previa y descarga del PDF. Se importa con next/dynamic y ssr: false
// (ver asistente-presupuesto.tsx) porque @react-pdf/renderer solo funciona en el navegador.

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { Download, LoaderCircle } from "lucide-react"

import {
  DocumentoPresupuesto,
  type DatosPdf,
} from "@/components/asistente/documento-pdf"
import { buttonVariants } from "@/components/ui/button"

function nombreArchivo(cliente: string, fecha: Date) {
  const slug = cliente
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `presupuesto-${slug || "cliente"}-${fecha.toISOString().slice(0, 10)}.pdf`
}

export default function VistaPreviaPdf({ datos }: { datos: DatosPdf }) {
  const documento = <DocumentoPresupuesto datos={datos} />

  return (
    <div className="flex flex-col gap-4">
      <PDFViewer
        showToolbar={false}
        className="h-[75vh] min-h-[480px] w-full rounded-lg border bg-muted"
      >
        {documento}
      </PDFViewer>
      <p className="text-xs text-muted-foreground sm:hidden">
        Algunos navegadores móviles no muestran la vista previa: puede descargar
        el PDF igualmente.
      </p>

      <PDFDownloadLink
        document={documento}
        fileName={nombreArchivo(datos.cliente, datos.fecha)}
        className={buttonVariants({ size: "lg", className: "h-10 px-4" })}
      >
        {({ loading }) =>
          loading ? (
            <>
              <LoaderCircle className="animate-spin" /> Generando PDF…
            </>
          ) : (
            <>
              <Download /> Aceptar y descargar PDF
            </>
          )
        }
      </PDFDownloadLink>
    </div>
  )
}
