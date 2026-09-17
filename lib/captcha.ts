/**
 * Verificación de CAPTCHA con Cloudflare Turnstile.
 *
 * Está desactivado mientras no exista `TURNSTILE_SECRET_KEY`. Eso permite
 * desplegar y probar sin depender de un proveedor, y activarlo después sin tocar
 * código: basta con definir las dos variables y reconstruir.
 *
 * Se eligió Turnstile porque es gratuito sin límite de uso, no muestra puzles a
 * la mayoría de visitantes y no requiere aceptar condiciones de publicidad.
 * Cambiar a hCaptcha o reCAPTCHA es sustituir la URL y el nombre del campo.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export function isCaptchaEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim())
}

export type CaptchaResult = { ok: true } | { ok: false; error: string }

/**
 * Comprueba el testigo que envía el widget del navegador.
 *
 * Si el CAPTCHA no está configurado, devuelve conforme: así el resto del código
 * no necesita saber si está activo o no.
 */
export async function verifyCaptcha(token: unknown, remoteIp?: string | null): Promise<CaptchaResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  if (!secret) return { ok: true }

  if (typeof token !== "string" || token.length === 0 || token.length > 4096) {
    return { ok: false, error: "Completa la verificación antes de continuar." }
  }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set("remoteip", remoteIp)

  try {
    // Un proveedor caído no debe dejar el formulario inservible, pero tampoco
    // debe abrir la puerta: se corta a los 5 segundos y se rechaza.
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    })
    const data = (await response.json()) as { success?: boolean }
    if (data.success === true) return { ok: true }
    return { ok: false, error: "La verificación no se completó. Inténtalo de nuevo." }
  } catch {
    return { ok: false, error: "No se pudo verificar. Inténtalo de nuevo en unos segundos." }
  }
}
