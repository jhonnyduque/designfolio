import { and, desc, eq, inArray, isNull } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { notifications } from "@/lib/db/schema"

export const runtime = "nodejs"

async function currentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  return session?.user.id ?? null
}

export async function GET(request: NextRequest) {
  const userId = await currentUser(request)
  if (!userId) return NextResponse.json({ error: "Inicia sesión para ver tus notificaciones." }, { status: 401 })
  const rows = await getDb().select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt)).limit(50)
  return NextResponse.json({ notifications: rows.map((row) => ({
    id: row.id,
    user_id: row.userId,
    type: row.type,
    target_id: row.targetId,
    payload: row.payload,
    read_at: row.readAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
  })) })
}

export async function PATCH(request: NextRequest) {
  const userId = await currentUser(request)
  if (!userId) return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  let body: unknown
  try { body = await request.json() } catch { body = null }
  const input = body && typeof body === "object" ? body as Record<string, unknown> : {}
  const ids = input.ids
  if (ids !== "all" && (!Array.isArray(ids) || ids.length > 50 || ids.some((id) => typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)))) {
    return NextResponse.json({ error: "Lista de notificaciones inválida." }, { status: 400 })
  }
  const filter = ids === "all"
    ? and(eq(notifications.userId, userId), isNull(notifications.readAt))
    : and(eq(notifications.userId, userId), inArray(notifications.id, ids as string[]))
  if (Array.isArray(ids) && ids.length === 0) return NextResponse.json({ updated: 0 })
  const result = await getDb().update(notifications).set({ readAt: new Date() }).where(filter)
  return NextResponse.json({ updated: result[0].affectedRows })
}
