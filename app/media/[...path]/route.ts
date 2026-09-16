import { createReadStream } from "fs"
import { stat } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import { contentTypeForPath, resolveMediaPath } from "@/lib/media-storage"

export const runtime = "nodejs"

/** El nombre de archivo lleva un UUID, así que el contenido nunca cambia. */
const CACHE_CONTROL = "public, max-age=31536000, immutable"

function toWebStream(filePath: string, options?: { start: number; end: number }) {
  const nodeStream = createReadStream(filePath, options)
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)))
      nodeStream.on("end", () => controller.close())
      nodeStream.on("error", (error) => controller.error(error))
    },
    cancel() {
      nodeStream.destroy()
    },
  })
}

/**
 * Sirve los medios guardados fuera del directorio de la aplicación.
 *
 * Como no están en `public/`, Next no los sirve solo. Esta ruta hace de puente y
 * es el único punto por el que se accede a ellos, así que aquí se concentra la
 * defensa contra travesía de rutas.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params

  const filePath = resolveMediaPath(segments)
  if (!filePath) return new NextResponse("Ruta no válida", { status: 400 })

  const contentType = contentTypeForPath(filePath)
  if (!contentType) return new NextResponse("Tipo de archivo no permitido", { status: 400 })

  let fileStat
  try {
    fileStat = await stat(filePath)
  } catch {
    return new NextResponse("Archivo no encontrado", { status: 404 })
  }
  if (!fileStat.isFile()) return new NextResponse("Archivo no encontrado", { status: 404 })

  const headers = {
    "Content-Type": contentType,
    "Cache-Control": CACHE_CONTROL,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  }

  // Sin rangos los videos no se pueden adelantar: el navegador tendría que
  // descargar el archivo entero antes de saltar a un punto.
  const range = request.headers.get("range")
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
    if (!match || (!match[1] && !match[2])) {
      return new NextResponse("Rango no válido", {
        status: 416,
        headers: { "Content-Range": `bytes */${fileStat.size}` },
      })
    }

    let start: number
    let end: number
    if (match[1]) {
      start = Number(match[1])
      end = match[2] ? Number(match[2]) : fileStat.size - 1
    } else {
      // Sufijo: los últimos N bytes.
      start = Math.max(0, fileStat.size - Number(match[2]))
      end = fileStat.size - 1
    }

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileStat.size) {
      return new NextResponse("Rango no satisfacible", {
        status: 416,
        headers: { "Content-Range": `bytes */${fileStat.size}` },
      })
    }
    end = Math.min(end, fileStat.size - 1)

    return new NextResponse(toWebStream(filePath, { start, end }), {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
        "Content-Length": String(end - start + 1),
      },
    })
  }

  return new NextResponse(toWebStream(filePath), {
    status: 200,
    headers: { ...headers, "Content-Length": String(fileStat.size) },
  })
}
