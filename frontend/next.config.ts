import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    // La raíz del repositorio también tiene package-lock.json (instalación con un solo
    // npm install). Se fija esta carpeta como raíz para que Next no use la del repositorio.
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
}

export default nextConfig
