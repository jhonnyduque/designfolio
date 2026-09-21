import { and, desc, eq, gte, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/client"
import { comments, notifications, profiles, works } from "@/lib/db/schema"
import { attachVisitorCookie, getActor } from "@/lib/server/actor"
import { LIMITS, checkRateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit"
import { COMMENT_CATEGORIES, COMMENT_MIN_LENGTH } from "@/types/comment"

export const runtime = "nodejs"
type Context = { params: Promise<{ id: string }> }

async function getApprovedWork(id: string) {
  const [work] = await getDb().select({ id: works.id, authorId: works.authorId })
    .from(works).where(and(eq(works.id, id), eq(works.moderationStatus, "approved"), sql`${works.archivedAt} is null`)).limit(1)
  return work
}

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params
  if (!await getApprovedWork(id)) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 })
  const rows = await getDb().select({
    id: comments.id,
    userId: comments.userId,
    visitorId: comments.visitorId,
    workId: comments.workId,
    content: comments.content,
    categories: comments.categories,
    createdAt: comments.createdAt,
    visitorName: comments.visitorName,
    username: profiles.username,
    fullName: profiles.fullName,
    avatarUrl: profiles.avatarUrl,
  }).from(comments).leftJoin(profiles, eq(comments.userId, profiles.id))
    .where(eq(comments.workId, id)).orderBy(desc(comments.createdAt)).limit(200)

  return NextResponse.json({ comments: rows.map((row) => ({
    id: row.id,
    user_id: row.userId ?? row.visitorId,
    work_id: row.workId,
    content: row.content,
    categories: row.categories ?? [],
    is_valid: true,
    created_at: row.createdAt.toISOString(),
    author_username: row.username ?? "visitante",
    author_full_name: row.fullName ?? row.visitorName ?? "Visitante",
    author_avatar_url: row.avatarUrl,
    source: row.userId ? "registered" : "public",
  })) })
}

export async function POST(request: NextRequest, { params }: Context) {
  // El freno por actor de más abajo se apoya en la cookie de visitante, que se
  // puede descartar y volver a pedir. Este va por dirección y no se rota igual.
  const limit = checkRateLimit(clientKey(request, "comment"), LIMITS.comment.limit, LIMITS.comment.window)
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Demasiados comentarios seguidos. Espera unos minutos.")
  }

  const { id } = await params
  const work = await getApprovedWork(id)
  if (!work) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 })
  const actor = await getActor(request)
  let body: unknown
  try { body = await request.json() } catch { body = null }
  const input = body && typeof body === "object" ? body as Record<string, unknown> : {}

  const content = typeof input.content === "string" ? input.content.trim() : ""
  const categories = Array.isArray(input.categories) ? input.categories : []
  if (content.length < COMMENT_MIN_LENGTH || content.length > 2000 ||
      categories.length < 1 || categories.length > COMMENT_CATEGORIES.length ||
      categories.some((category) => typeof category !== "string" || !COMMENT_CATEGORIES.includes(category as typeof COMMENT_CATEGORIES[number]))) {
    return NextResponse.json({ error: `El comentario debe tener entre ${COMMENT_MIN_LENGTH} y 2000 caracteres y una categoría válida.` }, { status: 400 })
  }

  const db = getDb()
  const actorFilter = actor.userId ? eq(comments.userId, actor.userId) : eq(comments.visitorId, actor.visitorId!)
  const [recent] = await db.select({ id: comments.id }).from(comments)
    .where(and(actorFilter, gte(comments.createdAt, new Date(Date.now() - 60_000))))
    .orderBy(desc(comments.createdAt)).limit(1)
  if (recent) return attachVisitorCookie(NextResponse.json({ error: "Espera un minuto antes de comentar de nuevo." }, { status: 429 }), actor.newVisitorId)

  const commentId = crypto.randomUUID()
  await db.insert(comments).values({
    id: commentId, workId: id, userId: actor.userId, visitorId: actor.visitorId,
    visitorName: actor.userId ? null : "Visitante", content,
    categories: categories as string[],
  })
  if (actor.userId !== work.authorId) {
    try {
      await db.insert(notifications).values({
        id: crypto.randomUUID(), userId: work.authorId, type: "comment", targetId: id,
        payload: { commentId, actor: actor.userId ? "usuario" : "Visitante" },
      })
    } catch (error) { console.error("Comment notification failed", error) }
  }
  return attachVisitorCookie(NextResponse.json({ id: commentId }, { status: 201 }), actor.newVisitorId)
}
