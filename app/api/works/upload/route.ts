import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ALLOWED_MEDIA_TYPES, validateMediaFile } from "@/lib/media"
import { SIGNATURE_BYTES, verifyDeclaredType } from "@/lib/media-signature"
import { mediaUrl, workMediaDirectory } from "@/lib/media-storage"
import { LIMITS, checkRateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(clientKey(request, "upload"), LIMITS.upload.limit, LIMITS.upload.window)
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Demasiadas subidas seguidas. Espera un momento antes de continuar.")
  }

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

  const buffer = Buffer.from(await file.arrayBuffer())

  // El `type` de un File lo pone el navegador según la extensión, así que quien
  // sube decide qué dice ser. Esto mira los primeros bytes, que no mienten.
  const signatureError = verifyDeclaredType(buffer.subarray(0, SIGNATURE_BYTES), file.type)
  if (signatureError) return NextResponse.json({ error: signatureError }, { status: 400 })

  const extension = ALLOWED_MEDIA_TYPES.get(file.type)!
  // El directorio se deriva del id de sesión, nunca de datos enviados por el
  // cliente, así que nadie puede escribir bajo el prefijo de otra persona.
  const directory = workMediaDirectory(session.user.id, workId)
  const filename = `${order}-${crypto.randomUUID()}.${extension}`

  try {
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(/* turbopackIgnore: true */ directory, filename), buffer)
  } catch (error) {
    console.error("No se pudo guardar el archivo", error)
    return NextResponse.json({ error: "No se pudo guardar el archivo. Revisa el almacenamiento del servidor." }, { status: 500 })
  }

  return NextResponse.json({ url: mediaUrl(session.user.id, workId, filename) })
}
