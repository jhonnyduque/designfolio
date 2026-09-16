import { and, eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/client"
import { likes, notifications, works } from "@/lib/db/schema"
import { attachVisitorCookie, getActor } from "@/lib/server/actor"

export const runtime = "nodejs"
type Context = { params: Promise<{ id: string }> }

async function getApprovedWork(id: string) {
  const [work] = await getDb().select({ id: works.id, authorId: works.authorId })
    .from(works).where(and(eq(works.id, id), eq(works.moderationStatus, "approved"), sql`${works.archivedAt} is null`)).limit(1)
  return work
}

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params
  const work = await getApprovedWork(id)
  if (!work) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 })
  const actor = await getActor(request)
  const where = actor.userId ? eq(likes.userId, actor.userId) : eq(likes.visitorId, actor.visitorId!)
  const [own, total] = await Promise.all([
    getDb().select({ id: likes.id }).from(likes).where(and(eq(likes.workId, id), where)).limit(1),
    getDb().select({ count: sql<number>`count(*)` }).from(likes).where(eq(likes.workId, id)),
  ])
  return attachVisitorCookie(NextResponse.json({ liked: own.length > 0, count: Number(total[0]?.count ?? 0) }), actor.newVisitorId)
}

export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params
  const work = await getApprovedWork(id)
  if (!work) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 })
  const actor = await getActor(request)
  const db = getDb()
  const where = actor.userId ? eq(likes.userId, actor.userId) : eq(likes.visitorId, actor.visitorId!)
  const [own] = await db.select({ id: likes.id }).from(likes).where(and(eq(likes.workId, id), where)).limit(1)
  let liked = false
  if (own) {
    await db.delete(likes).where(eq(likes.id, own.id))
  } else {
    let inserted = false
    try {
      await db.insert(likes).values({ id: crypto.randomUUID(), workId: id, userId: actor.userId, visitorId: actor.visitorId })
      inserted = true
    } catch (error) {
      if ((error as { cause?: { code?: string } }).cause?.code !== "ER_DUP_ENTRY") throw error
    }
    liked = true
    if (inserted && actor.userId !== work.authorId) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(), userId: work.authorId, type: "like", targetId: id,
        payload: { actor: actor.userId ? "usuario" : "Visitante" },
      })
    }
  }
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(likes).where(eq(likes.workId, id))
  return attachVisitorCookie(NextResponse.json({ liked, count: Number(total?.count ?? 0) }), actor.newVisitorId)
}
