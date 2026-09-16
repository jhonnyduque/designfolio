import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ALLOWED_MEDIA_TYPES, validateMediaFile } from "@/lib/media"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "La carga de archivos local está desactivada en producción hasta configurar almacenamiento persistente." }, { status: 503 })
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

  const extension = ALLOWED_MEDIA_TYPES.get(file.type)!
  const safeDirectory = path.join(process.cwd(), "public", "uploads", session.user.id, workId)
  const filename = `${order}-${crypto.randomUUID()}.${extension}`
  await mkdir(safeDirectory, { recursive: true })
  await writeFile(path.join(safeDirectory, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/${session.user.id}/${workId}/${filename}` })
}
