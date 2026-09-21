import { and, eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/client"
import { workViewReceipts, works } from "@/lib/db/schema"
import { LIMITS, checkRateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit"
import { attachVisitorCookie, getActor } from "@/lib/server/actor"
import { isViewOrigin, VIEW_DEDUPLICATION_MS } from "@/lib/views"

export const runtime = "nodejs"
type Context = { params: Promise<{ id: string }> }

/**
 * Valida que un POST de vista venga del mismo sitio sin depender de
 * request.nextUrl.origin, que detrás de un reverse proxy puede representar
 * el origen interno del servidor y no el dominio público visto por el navegador.
 */
function isAllowedRequestOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite === "cross-site") return false

  const originHeader = request.headers.get("origin")
  if (!originHeader) return true

  const forwardedHost = request.headers.get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim()
  const requestHost = request.headers.get("host")?.trim()
  const expectedHost = forwardedHost || requestHost || request.nextUrl.host

  try {
    return new URL(originHeader).host === expectedHost
  } catch {
    return false
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 })
  }

  const limit = checkRateLimit(clientKey(request, "view"), LIMITS.view.limit, LIMITS.view.window)
  if (!limit.allowed) return tooManyRequests(limit.retryAfter, "Demasiadas vistas seguidas. Espera un momento.")

  let origin: unknown
  try {
    ({ origin } = await request.json())
  } catch {
    return NextResponse.json({ error: "Datos de vista inválidos." }, { status: 400 })
  }
  if (!isViewOrigin(origin)) return NextResponse.json({ error: "Origen de vista inválido." }, { status: 400 })

  const { id } = await params
  const actor = await getActor(request)
  const db = getDb()
  const [initialWork] = await db.select({ id: works.id, authorId: works.authorId, viewsCount: works.viewsCount })
    .from(works)
    .where(and(eq(works.id, id), eq(works.moderationStatus, "approved"), sql`${works.archivedAt} is null`))
    .limit(1)
  if (!initialWork) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 })

  if (actor.userId === initialWork.authorId) {
    return NextResponse.json(
      { counted: false, viewsCount: initialWork.viewsCount, reason: "own_work" },
      { headers: { "Cache-Control": "no-store" } },
    )
  }

  const viewerKey = actor.userId ? `user:${actor.userId}` : `visitor:${actor.visitorId}`
  const result = await db.transaction(async (tx) => {
    const [work] = await tx.select({ id: works.id, viewsCount: works.viewsCount })
      .from(works).where(eq(works.id, id)).limit(1).for("update")
    if (!work) return null

    const [receipt] = await tx.select({ id: workViewReceipts.id, lastCountedAt: workViewReceipts.lastCountedAt })
      .from(workViewReceipts)
      .where(and(eq(workViewReceipts.workId, id), eq(workViewReceipts.viewerKey, viewerKey)))
      .limit(1).for("update")
    const now = new Date()
    const cutoff = new Date(now.getTime() - VIEW_DEDUPLICATION_MS)
    if (receipt && receipt.lastCountedAt >= cutoff) {
      return { counted: false, viewsCount: work.viewsCount, reason: "already_counted" as const }
    }

    if (receipt) {
      await tx.update(workViewReceipts).set({ lastCountedAt: now, lastOrigin: origin }).where(eq(workViewReceipts.id, receipt.id))
    } else {
      try {
        await tx.insert(workViewReceipts).values({ id: crypto.randomUUID(), workId: id, viewerKey, lastOrigin: origin, lastCountedAt: now })
      } catch (error) {
        if ((error as { cause?: { code?: string } }).cause?.code !== "ER_DUP_ENTRY") throw error
        return { counted: false, viewsCount: work.viewsCount, reason: "already_counted" as const }
      }
    }
    await tx.update(works).set({ viewsCount: sql`${works.viewsCount} + 1` }).where(eq(works.id, id))
    return { counted: true, viewsCount: work.viewsCount + 1 }
  })
  if (!result) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 })

  const response = NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
  return actor.userId ? response : attachVisitorCookie(response, actor.newVisitorId)
}
