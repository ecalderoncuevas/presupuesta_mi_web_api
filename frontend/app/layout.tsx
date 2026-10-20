import type { Metadata } from "next"
import { Geist_Mono, Inter, Lexend_Giga } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

// Títulos al estilo de Succession. La serie usa Engravers Gothic y Sackers Gothic
// (Monotype, de pago); Lexend Giga es la alternativa libre más parecida: gótica extendida.
const lexendGiga = Lexend_Giga({
  subsets: ["latin"],
  variable: "--font-display",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Waverly & Hale · Panel de presupuestos",
  description:
    "Panel corporativo para crear y editar presupuestos web calculados por la API con las tarifas del servidor.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        lexendGiga.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
