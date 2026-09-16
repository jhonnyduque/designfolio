import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { works } from "@/lib/db/schema"
import { WORK_LIMITS } from "@/types/work"

export const runtime = "nodejs"

async function ownedWork(request: NextRequest, id: string) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return { error: NextResponse.json({ error: "Sesión requerida." }, { status: 401 }) }
  const [work] = await getDb().select().from(works).where(and(eq(works.id, id), eq(works.authorId, session.user.id))).limit(1)
  if (!work) return { error: NextResponse.json({ error: "Proyecto no encontrado o sin permisos." }, { status: 404 }) }
  return { work, userId: session.user.id }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const access = await ownedWork(request, id)
  if (access.error) return access.error
  let body: { archived?: unknown; title?: unknown; description?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "No se pudo leer la solicitud." }, { status: 400 })
  }

  const updates: Partial<typeof works.$inferInsert> = {}

  if ("archived" in body) {
    if (typeof body.archived !== "boolean") {
      return NextResponse.json({ error: "Indica si deseas archivar o restaurar el proyecto." }, { status: 400 })
    }
    updates.archivedAt = body.archived ? new Date() : null
  }

  if ("title" in body) {
    const title = typeof body.title === "string" ? body.title.trim() : ""
    if (title.length < WORK_LIMITS.TITLE_MIN || title.length > WORK_LIMITS.TITLE_MAX) {
      return NextResponse.json({ error: `El título debe tener entre ${WORK_LIMITS.TITLE_MIN} y ${WORK_LIMITS.TITLE_MAX} caracteres.` }, { status: 400 })
    }
    updates.title = title
  }

  if ("description" in body) {
    const description = typeof body.description === "string" ? body.description.trim() : ""
    if (description.length < WORK_LIMITS.DESCRIPTION_MIN) {
      return NextResponse.json({ error: `La descripción debe tener al menos ${WORK_LIMITS.DESCRIPTION_MIN} caracteres.` }, { status: 400 })
    }
    if (description.length > 10000) {
      return NextResponse.json({ error: "La descripción supera el límite de 10.000 caracteres." }, { status: 400 })
    }
    updates.description = description
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No hay nada que actualizar." }, { status: 400 })
  }

  updates.updatedAt = new Date()
  await getDb().update(works).set(updates).where(eq(works.id, id))
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const access = await ownedWork(request, id)
  if (access.error) return access.error
  await getDb().delete(works).where(eq(works.id, id))
  return NextResponse.json({ success: true })
}
