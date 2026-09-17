import { createHmac, timingSafeEqual } from "crypto"

/**
 * Traslado del código de invitación a través del desvío por Google.
 *
 * El registro con correo manda el código en una cabecera, pero OAuth sale hacia
 * Google y vuelve en una petición distinta donde esa cabecera ya no existe. Por
 * eso el proveedor social estaba desactivado: sin esto, cualquiera con una
 * cuenta de Google entraría saltándose la invitación.
 *
 * La cookie va firmada con `BETTER_AUTH_SECRET` y caduca en 15 minutos, así que
 * no sirve para fabricar invitaciones: solo transporta un código que además
 * seguirá validándose contra la base al canjearlo.
 */

const COOKIE_NAME = "df_invite"
const MAX_AGE_SECONDS = 15 * 60

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET
  if (!value) throw new Error("BETTER_AUTH_SECRET no está configurada.")
  return value
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

/** Devuelve el valor a guardar en la cookie: código, caducidad y firma. */
export function packInviteCode(code: string): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000
  const payload = `${Buffer.from(code, "utf8").toString("base64url")}.${expiresAt}`
  return `${payload}.${sign(payload)}`
}

/** Extrae el código si la firma es válida y no ha caducado; null en cualquier otro caso. */
export function unpackInviteCode(value: string | undefined): string | null {
  if (!value) return null

  const parts = value.split(".")
  if (parts.length !== 3) return null
  const [encoded, expiresAt, signature] = parts

  const expected = sign(`${encoded}.${expiresAt}`)
  // Comparación en tiempo constante: una comparación normal filtra información
  // sobre la firma correcta a base de medir cuánto tarda en fallar.
  const given = Buffer.from(signature)
  const wanted = Buffer.from(expected)
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null

  const expiry = Number(expiresAt)
  if (!Number.isFinite(expiry) || expiry <= Date.now()) return null

  const code = Buffer.from(encoded, "base64url").toString("utf8")
  return code.length > 0 && code.length <= 64 ? code : null
}

export const INVITE_COOKIE_NAME = COOKIE_NAME
export const INVITE_COOKIE_MAX_AGE = MAX_AGE_SECONDS
