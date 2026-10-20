// Separa claves, cadenas, números y booleanos para colorear el JSON
const TOKENS_JSON = /("(?:\\.|[^"\\])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

function claseToken(token: string) {
  if (token.endsWith(":")) return "text-foreground"
  if (token.startsWith('"')) return "text-success"
  if (/^(true|false|null)$/.test(token)) return "text-accent-foreground"
  return "text-gold"
}

// JSON con formato y colores, siempre sobre fondo oscuro (clase "dark")
export function BloqueJson({ valor }: { valor: unknown }) {
  const partes = JSON.stringify(valor, null, 2).split(TOKENS_JSON)
  return (
    <pre className="dark overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-xs leading-relaxed text-muted-foreground">
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <span key={i} className={claseToken(parte)}>
            {parte}
          </span>
        ) : (
          parte
        )
      )}
    </pre>
  )
}
