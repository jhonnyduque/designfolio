import { NextRequest, NextResponse } from "next/server"
import { INVITE_COOKIE_MAX_AGE, INVITE_COOKIE_NAME, packInviteCode } from "@/lib/invite-cookie"
import { LIMITS, checkRateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit"

export const runtime = "nodejs"

/**
 * Guarda el código de invitación en una cookie firmada, justo antes de que el
 * navegador salga hacia Google.
 *
 * Aquí no se valida el código contra la base a propósito: hacerlo convertiría
 * este endpoint en un oráculo para averiguar qué códigos existen probándolos uno
 * a uno. La validación real ocurre al volver, en el hook de creación de usuario,
 * que además lo canjea de forma atómica.
 */
export async function POST(request: NextRequest) {
  const limit = checkRateLimit(clientKey(request, "auth"), LIMITS.auth.limit, LIMITS.auth.window)
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Demasiados intentos. Espera unos minutos.")
  }

  let code = ""
  try {
    const body = (await request.json()) as { code?: unknown }
    code = typeof body.code === "string" ? body.code.trim() : ""
  } catch {
    code = ""
  }

  if (!code || code.length > 64) {
    return NextResponse.json({ error: "Indica un código de invitación válido." }, { status: 400 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(INVITE_COOKIE_NAME, packInviteCode(code), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // "lax" y no "strict": la cookie debe sobrevivir al regreso desde Google.
    path: "/",
    maxAge: INVITE_COOKIE_MAX_AGE,
  })
  return response
}
