import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const COOKIE_NAME = "df_visitor"
const VISITOR_PATTERN = /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i

export async function getActor(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (session?.user) return { userId: session.user.id, visitorId: null, newVisitorId: null }

  const existing = request.cookies.get(COOKIE_NAME)?.value
  const visitorId = existing && VISITOR_PATTERN.test(existing) ? existing : crypto.randomUUID()
  return { userId: null, visitorId, newVisitorId: existing === visitorId ? null : visitorId }
}

export function attachVisitorCookie(response: NextResponse, newVisitorId: string | null) {
  if (newVisitorId) response.cookies.set(COOKIE_NAME, newVisitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}
