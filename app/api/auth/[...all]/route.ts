import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { verifyCaptcha } from "@/lib/captcha"
import { LIMITS, checkRateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit"

const handler = toNextJsHandler(auth)

/** Rutas de Better Auth donde un CAPTCHA aporta algo: crean cuentas o mandan correo. */
const CAPTCHA_PATHS = ["/sign-up", "/forget-password", "/request-password-reset"]

export const GET = handler.GET

/**
 * Todo lo sensible de Better Auth llega por POST: registro, inicio de sesión y
 * restablecimiento de contraseña. Son los tres objetivos clásicos de fuerza
 * bruta y de alta masiva de cuentas, así que el límite se aplica aquí, antes de
 * que la petición llegue a la librería.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, "auth"), LIMITS.auth.limit, LIMITS.auth.window)
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Demasiados intentos. Espera unos minutos antes de volver a probar.")
  }

  const path = new URL(request.url).pathname
  if (CAPTCHA_PATHS.some((candidate) => path.endsWith(candidate))) {
    // El cuerpo solo se puede leer una vez, así que se clona para inspeccionarlo
    // y dejar el original intacto para Better Auth.
    let token: unknown = null
    try {
      const body = (await request.clone().json()) as Record<string, unknown>
      token = body.captchaToken
    } catch {
      token = null
    }

    const captcha = await verifyCaptcha(token, request.headers.get("x-forwarded-for"))
    if (!captcha.ok) {
      return new Response(JSON.stringify({ message: captcha.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  return handler.POST(request)
}
