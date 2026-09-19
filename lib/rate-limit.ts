/**
 * Limitador de peticiones en memoria.
 *
 * La aplicación corre en un único proceso Node, así que un contador en memoria
 * basta y evita añadir Redis o escrituras en base por cada petición. Sus dos
 * límites conocidos: el contador se reinicia al reiniciar la aplicación, y no
 * sirve si algún día se reparte la carga entre varias instancias. En ese caso
 * hay que mover `hits` a un almacén compartido; el resto del código no cambia.
 *
 * No sustituye a un CAPTCHA: frena la fuerza bruta y el abuso automatizado desde
 * una misma dirección, no a alguien con muchas direcciones.
 */

type Entry = { count: number; resetAt: number }

const hits = new Map<string, Entry>()

/** Sin esto, un atacante rotando claves haría crecer el mapa sin tope. */
const MAX_TRACKED_KEYS = 20_000

function purgeExpired(now: number) {
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key)
  }
}

export type RateLimitResult = {
  allowed: boolean
  /** Segundos que faltan para poder reintentar. Solo tiene sentido si `allowed` es falso. */
  retryAfter: number
  remaining: number
}

export function checkRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  if (hits.size > MAX_TRACKED_KEYS) purgeExpired(now)

  const entry = hits.get(key)
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0, remaining: limit - 1 }
  }

  entry.count += 1
  if (entry.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      remaining: 0,
    }
  }

  return { allowed: true, retryAfter: 0, remaining: limit - entry.count }
}

/**
 * Dirección del cliente.
 *
 * En Hostinger la aplicación va detrás de LiteSpeed, así que la dirección real
 * llega en `x-forwarded-for`. Se toma el primer valor, que es el cliente
 * original; los siguientes son los proxies intermedios.
 *
 * Es falsificable si alguien llegara al proceso Node sin pasar por el proxy, algo
 * que en este alojamiento no ocurre. Aun así el límite nunca es la única defensa
 * de una operación sensible: detrás sigue habiendo comprobación de sesión y de
 * propiedad.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const address = forwarded?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "desconocida"
  return `${scope}:${address}`
}

/** Respuesta 429 con la cabecera `Retry-After`, que es lo que los clientes esperan. */
export function tooManyRequests(retryAfter: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  })
}

/** Límites por operación: intentos permitidos dentro de una ventana, en segundos. */
export const LIMITS = {
  /** Registro, inicio de sesión y restablecimiento: lo más atacado por fuerza bruta. */
  auth: { limit: 10, window: 600 },
  comment: { limit: 10, window: 300 },
  like: { limit: 60, window: 60 },
  view: { limit: 30, window: 60 },
  share: { limit: 30, window: 60 },
  upload: { limit: 40, window: 600 },
  publish: { limit: 10, window: 3600 },
} as const
