// lib/profile-validation.ts
import { PROFILE_LIMITS } from "@/types/profile"

/**
 * Reglas del perfil, compartidas por el formulario y por la API.
 *
 * Se exigen enteras una sola vez, al completar el perfil: ahí es donde tiene
 * sentido pedir una bio de verdad y una especialidad, porque es lo que va a ver
 * el resto de la comunidad. Después, en Ajustes, cambiar la foto no puede
 * depender de volver a escribir ochenta caracteres; lo que se pide es que lo
 * que haya sea válido, no que esté todo.
 *
 * Devuelve lo que falta, en texto, para que la interfaz pueda decirlo en lugar
 * de limitarse a apagar el botón.
 */

export type DatosPerfil = {
  fullName: string
  bio: string
  categories: string[]
}

export function faltasDelPerfil(
  datos: DatosPerfil,
  { primeraVez }: { primeraVez: boolean },
): string[] {
  const faltas: string[] = []
  const bio = datos.bio.trim()

  if (datos.fullName.trim().length < 2) faltas.push("escribe tu nombre completo")

  // Una bio vacía es aceptable en una edición; una bio de tres palabras no lo
  // es nunca, porque queda peor que no tener ninguna.
  const bioObligatoria = primeraVez || bio.length > 0
  if (bioObligatoria && (bio.length < PROFILE_LIMITS.BIO_MIN || bio.length > PROFILE_LIMITS.BIO_MAX)) {
    faltas.push(
      bio.length === 0
        ? `escribe una bio de ${PROFILE_LIMITS.BIO_MIN} a ${PROFILE_LIMITS.BIO_MAX} caracteres`
        : `la bio va de ${PROFILE_LIMITS.BIO_MIN} a ${PROFILE_LIMITS.BIO_MAX} caracteres (llevas ${bio.length})`,
    )
  }

  const minimoCategorias = primeraVez ? PROFILE_LIMITS.CATEGORIES_MIN : 0
  if (datos.categories.length < minimoCategorias) {
    faltas.push(`elige al menos ${minimoCategorias} especialidad`)
  }
  if (datos.categories.length > PROFILE_LIMITS.CATEGORIES_MAX) {
    faltas.push(`elige como mucho ${PROFILE_LIMITS.CATEGORIES_MAX} especialidades`)
  }

  return faltas
}
