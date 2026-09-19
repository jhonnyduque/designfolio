/**
 * La aceptación de los Términos de uso al crear una cuenta.
 *
 * Aceptar los Términos es un acto contractual y conviene poder demostrarlo: qué
 * cuenta aceptó, cuándo, y qué versión del texto tenía delante. Marcar una
 * casilla en el navegador no demuestra nada si el servidor no se entera, así
 * que el alta exige la señal y guarda el registro.
 *
 * La Política de privacidad NO viaja por aquí a propósito. Una política de
 * privacidad se informa, no se acepta (arts. 13-14 RGPD), y la de Designfolio
 * declara como base jurídica de la cuenta el art. 6.1.b —ejecución de la
 * relación—, no el consentimiento. Pedir que se "acepte" daría a entender una
 * base que la propia política niega.
 *
 * La señal no va firmada, y es deliberado. El código de invitación sí lo va
 * porque concede acceso y falsificarlo abriría la beta cerrada; esto solo es
 * una declaración de alguien sobre sí mismo. Quien la falsifique estará
 * falsificando su propia aceptación, y seguirá obligado por los Términos al
 * usar el servicio.
 */

/** Fecha de la última actualización de los Términos publicados en /terminos. */
export const TERMS_VERSION = "2026-09-18"

/** Registro por correo: la señal viaja en una cabecera de la propia petición. */
export const TERMS_HEADER = "x-designfolio-terms"

/**
 * Registro con Google: la petición sale hacia Google y vuelve en otra distinta,
 * donde la cabecera ya no existe. Por eso ahí viaja en cookie, igual que el
 * código de invitación.
 */
export const TERMS_COOKIE_NAME = "df_terms"

/** Diez minutos: lo que tarda un desvío por Google, con holgura. */
export const TERMS_COOKIE_MAX_AGE = 10 * 60

/** Mensaje compartido por la validación del navegador y la del servidor. */
export const TERMS_REQUIRED_MESSAGE = "Debes aceptar los Términos de uso para crear una cuenta."

/**
 * Devuelve la versión aceptada, mirando primero la cabecera y luego la cookie.
 * Null si no llega ninguna señal o si no coincide con la versión vigente: una
 * aceptación de un texto que ya no está publicado no vale como aceptación de
 * este.
 */
export function readTermsAcceptance(headers: Headers | undefined): string | null {
  const fromHeader = headers?.get(TERMS_HEADER)?.trim()
  if (fromHeader) return fromHeader === TERMS_VERSION ? TERMS_VERSION : null

  const cookieHeader = headers?.get("cookie")
  if (!cookieHeader) return null

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${TERMS_COOKIE_NAME}=`))
  if (!match) return null

  const value = decodeURIComponent(match.slice(TERMS_COOKIE_NAME.length + 1)).trim()
  return value === TERMS_VERSION ? TERMS_VERSION : null
}
