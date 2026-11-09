// Documento PDF del presupuesto (@react-pdf/renderer).
// Se construye con componentes React y genera un PDF real con texto seleccionable.
// Los importes llegan tal cual de POST /api/calcular: aquí no se calcula nada.

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import { euros } from "@/lib/formato"
import type { PresupuestoCalculado } from "@/lib/propuesta"

export type DatosPdf = {
  cliente: string
  fecha: Date
  resumen: string
  presupuesto: PresupuestoCalculado
  // Motivo de cada servicio (del asistente o añadido por el usuario)
  justificaciones: Record<string, string>
  aclaraciones: string[]
  fueraDeCatalogo: string[]
}

const TINTA = "#1d2433"
const LATON = "#b08d3c"
const GRIS = "#6b7080"
const LINEA = "#e3dfd4"

const estilos = StyleSheet.create({
  pagina: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: TINTA,
    lineHeight: 1.4,
  },
  cabecera: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: LATON,
  },
  marca: { fontFamily: "Helvetica-Bold", fontSize: 13, letterSpacing: 3 },
  tituloDoc: { fontSize: 10, color: GRIS, letterSpacing: 1 },
  datos: { flexDirection: "row", gap: 24, marginTop: 16 },
  dato: { flexDirection: "column" },
  etiqueta: {
    fontSize: 7.5,
    color: GRIS,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  valor: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  seccion: { marginTop: 20 },
  tituloSeccion: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: LATON,
    marginBottom: 6,
  },
  servicio: { marginBottom: 8 },
  nombreServicio: { fontFamily: "Helvetica-Bold" },
  textoSecundario: { color: GRIS, fontSize: 9 },
  fila: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: LINEA,
  },
  filaCabecera: { borderBottomColor: TINTA },
  celdaConcepto: { flex: 1 },
  celdaCantidad: { width: 50, textAlign: "right" },
  celdaPrecio: { width: 80, textAlign: "right" },
  celdaImporte: { width: 80, textAlign: "right" },
  negrita: { fontFamily: "Helvetica-Bold" },
  filaTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: TINTA,
  },
  total: { fontFamily: "Helvetica-Bold", fontSize: 13 },
  elementoLista: { flexDirection: "row", marginBottom: 3 },
  vineta: { width: 10, color: LATON },
  pie: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 7.5,
    color: GRIS,
    borderTopWidth: 1,
    borderTopColor: LINEA,
    paddingTop: 6,
  },
})

// Intl usa espacios especiales que algunas fuentes PDF no tienen: se cambian por espacios normales
const importe = (cantidad: number) =>
  euros(cantidad).replace(/[\u00a0\u202f]/g, " ")

export function DocumentoPresupuesto({ datos }: { datos: DatosPdf }) {
  const {
    cliente,
    fecha,
    resumen,
    presupuesto,
    justificaciones,
    aclaraciones,
    fueraDeCatalogo,
  } = datos
  const fechaTexto = fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <Document
      title={`Presupuesto · ${cliente}`}
      author="Waverly & Hale"
      subject="Presupuesto de proyecto web"
      language="es-ES"
    >
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.cabecera}>
          <Text style={estilos.marca}>WAVERLY &amp; HALE</Text>
          <Text style={estilos.tituloDoc}>PRESUPUESTO DE PROYECTO WEB</Text>
        </View>

        <View style={estilos.datos}>
          <View style={estilos.dato}>
            <Text style={estilos.etiqueta}>Cliente</Text>
            <Text style={estilos.valor}>{cliente}</Text>
          </View>
          <View style={estilos.dato}>
            <Text style={estilos.etiqueta}>Fecha</Text>
            <Text style={estilos.valor}>{fechaTexto}</Text>
          </View>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Resumen del proyecto</Text>
          <Text>{resumen || "Sin resumen."}</Text>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Servicios confirmados</Text>
          {presupuesto.lineas.map((linea) => (
            <View key={linea.id} style={estilos.servicio} wrap={false}>
              <Text style={estilos.nombreServicio}>{linea.nombre}</Text>
              <Text style={estilos.textoSecundario}>{linea.descripcion}</Text>
              {justificaciones[linea.id] && (
                <Text style={estilos.textoSecundario}>
                  Motivo: {justificaciones[linea.id]}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={estilos.seccion} wrap={false}>
          <Text style={estilos.tituloSeccion}>Desglose de importes</Text>
          <View style={[estilos.fila, estilos.filaCabecera]}>
            <Text style={[estilos.celdaConcepto, estilos.negrita]}>
              Concepto
            </Text>
            <Text style={[estilos.celdaCantidad, estilos.negrita]}>Cant.</Text>
            <Text style={[estilos.celdaPrecio, estilos.negrita]}>
              Precio unit.
            </Text>
            <Text style={[estilos.celdaImporte, estilos.negrita]}>Importe</Text>
          </View>
          {presupuesto.lineas.map((linea) => (
            <View key={linea.id} style={estilos.fila}>
              <Text style={estilos.celdaConcepto}>{linea.nombre}</Text>
              <Text style={estilos.celdaCantidad}>{linea.cantidad}</Text>
              <Text style={estilos.celdaPrecio}>
                {importe(linea.precioUnitario)}
              </Text>
              <Text style={estilos.celdaImporte}>{importe(linea.importe)}</Text>
            </View>
          ))}
          <View style={estilos.filaTotal}>
            <Text style={estilos.negrita}>TOTAL</Text>
            <Text style={estilos.total}>{importe(presupuesto.total)}</Text>
          </View>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>
            Aclaraciones y aspectos pendientes
          </Text>
          {aclaraciones.length === 0 && fueraDeCatalogo.length === 0 && (
            <Text style={estilos.textoSecundario}>
              No hay aspectos pendientes de concretar.
            </Text>
          )}
          {aclaraciones.map((texto) => (
            <View key={texto} style={estilos.elementoLista}>
              <Text style={estilos.vineta}>•</Text>
              <Text style={{ flex: 1 }}>{texto}</Text>
            </View>
          ))}
          {fueraDeCatalogo.length > 0 && (
            <>
              <Text
                style={[estilos.negrita, { marginTop: 6, marginBottom: 3 }]}
              >
                Pendiente de valorar (fuera del catálogo, no incluido en el
                total):
              </Text>
              {fueraDeCatalogo.map((texto) => (
                <View key={texto} style={estilos.elementoLista}>
                  <Text style={estilos.vineta}>•</Text>
                  <Text style={{ flex: 1 }}>{texto}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <Text style={estilos.pie} fixed>
          Importes calculados por el servidor con las tarifas vigentes · Waverly
          &amp; Hale
        </Text>
      </Page>
    </Document>
  )
}
