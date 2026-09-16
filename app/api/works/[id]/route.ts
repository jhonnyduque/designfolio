import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { works } from "@/lib/db/schema"

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
  const body = await request.json() as { archived?: unknown }
  if (typeof body.archived !== "boolean") return NextResponse.json({ error: "Indica si deseas archivar o restaurar el proyecto." }, { status: 400 })
  await getDb().update(works).set({ archivedAt: body.archived ? new Date() : null, updatedAt: new Date() }).where(eq(works.id, id))
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const access = await ownedWork(request, id)
  if (access.error) return access.error
  await getDb().delete(works).where(eq(works.id, id))
  return NextResponse.json({ success: true })
}
