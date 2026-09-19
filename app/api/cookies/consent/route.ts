import { NextRequest, NextResponse } from "next/server"
import { ANALYTICS_CONSENT_VALUE, COOKIE_CONSENT_NAME } from "@/lib/cookie-consent"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const forwardedOrigin = forwardedProto && forwardedHost ? `${forwardedProto}://${forwardedHost}` : null
  const requestOrigin = request.nextUrl.origin
  if (!origin || ![requestOrigin, forwardedOrigin].includes(origin)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 })
  }

  let analytics: unknown
  try {
    ({ analytics } = await request.json())
  } catch {
    return NextResponse.json({ error: "Preferencia inválida." }, { status: 400 })
  }
  if (typeof analytics !== "boolean") {
    return NextResponse.json({ error: "Preferencia inválida." }, { status: 400 })
  }

  const response = NextResponse.json({ analytics })
  response.cookies.set(COOKIE_CONSENT_NAME, analytics ? ANALYTICS_CONSENT_VALUE : "essential-v1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  })
  return response
}
