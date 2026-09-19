import { NextRequest, NextResponse } from "next/server"
import { ANALYTICS_CONSENT_VALUE, COOKIE_CONSENT_NAME } from "@/lib/cookie-consent"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
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
