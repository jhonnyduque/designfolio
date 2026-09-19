import { and, eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/client"
import { workShareReceipts, works } from "@/lib/db/schema"
import { hasAnalyticsConsent, COOKIE_CONSENT_NAME } from "@/lib/cookie-consent"
import { LIMITS, checkRateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit"
import { attachVisitorCookie, getActor } from "@/lib/server/actor"

export const runtime = "nodejs"
type Context = { params: Promise<{ id: string }> }

const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHARE_SESSION_COOKIE = "df_share_session"

function attachShareSessionCookie(response: NextResponse, newSessionId: string | null) {
  if (newSessionId) response.cookies.set(SHARE_SESSION_COOKIE, newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
  return response
}

export async function POST(request: NextRequest, { params }: Context) {
  if (request.headers.get("origin") !== request.nextUrl.origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 })
  }

  const limit = checkRateLimit(clientKey(request, "share"), LIMITS.share.limit, LIMITS.share.window)
  if (!limit.allowed) return tooManyRequests(limit.retryAfter, "Demasiados compartidos seguidos. Espera un momento.")

  const { id } = await params
  const actor = await getActor(request)
  const analyticsAllowed = actor.userId !== null || hasAnalyticsConsent(request.cookies.get(COOKIE_CONSENT_NAME)?.value)
  const db = getDb()
  const [initialWork] = await db.select({ id: works.id, sharesCount: works.sharesCount })
    .from(works)
    .where(and(eq(works.id, id), eq(works.moderationStatus, "approved"), sql`${works.archivedAt} is null`))
    .limit(1)
  if (!initialWork) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 })
  if (!analyticsAllowed) {
    return NextResponse.json({ counted: false, sharesCount: initialWork.sharesCount, reason: "consent_required" }, { headers: { "Cache-Control": "no-store" } })
  }

  const cookieSessionId = request.cookies.get(SHARE_SESSION_COOKIE)?.value
  const sessionId = cookieSessionId && SESSION_ID_PATTERN.test(cookieSessionId) ? cookieSessionId : crypto.randomUUID()
  const newSessionId = cookieSessionId === sessionId ? null : sessionId

  const result = await db.transaction(async (tx) => {
    const [work] = await tx.select({ id: works.id, sharesCount: works.sharesCount })
      .from(works).where(eq(works.id, id)).limit(1).for("update")
    if (!work) return null

    const [receipt] = await tx.select({ id: workShareReceipts.id })
      .from(workShareReceipts)
      .where(and(eq(workShareReceipts.workId, id), eq(workShareReceipts.sessionId, sessionId)))
      .limit(1).for("update")
    if (receipt) return { counted: false, sharesCount: work.sharesCount, reason: "already_counted" }

    await tx.insert(workShareReceipts).values({ id: crypto.randomUUID(), workId: id, sessionId })
    await tx.update(works).set({ sharesCount: sql`${works.sharesCount} + 1` }).where(eq(works.id, id))
    return { counted: true, sharesCount: work.sharesCount + 1 }
  })
  if (!result) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 })

  const response = NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
  const responseWithVisitor = actor.userId ? response : attachVisitorCookie(response, actor.newVisitorId)
  return attachShareSessionCookie(responseWithVisitor, newSessionId)
}
