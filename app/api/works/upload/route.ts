import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ALLOWED_MEDIA_TYPES, validateMediaFile } from "@/lib/media"
import { mediaUrl, workMediaDirectory } from "@/lib/media-storage"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return NextResponse.json({ error: "Tu sesión expiró. Inicia sesión para subir archivos." }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file")
  const workId = formData.get("workId")
  const order = Number(formData.get("order"))
  if (!(file instanceof File) || typeof workId !== "string" || !/^[0-9a-f-]{36}$/i.test(workId) || !Number.isInteger(order) || order < 0 || order > 5) {
    return NextResponse.json({ error: "Solicitud de carga inválida." }, { status: 400 })
  }
  const validationError = validateMediaFile(file)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const extension = ALLOWED_MEDIA_TYPES.get(file.type)!
  // El directorio se deriva del id de sesión, nunca de datos enviados por el
  // cliente, así que nadie puede escribir bajo el prefijo de otra persona.
  const directory = workMediaDirectory(session.user.id, workId)
  const filename = `${order}-${crypto.randomUUID()}.${extension}`

  try {
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(/* turbopackIgnore: true */ directory, filename), Buffer.from(await file.arrayBuffer()))
  } catch (error) {
    console.error("No se pudo guardar el archivo", error)
    return NextResponse.json({ error: "No se pudo guardar el archivo. Revisa el almacenamiento del servidor." }, { status: 500 })
  }

  return NextResponse.json({ url: mediaUrl(session.user.id, workId, filename) })
}
