// lib/profile-validation.ts
import { PROFILE_LIMITS } from "@/types/profile"

export type DatosPerfil = {
  fullName: string
  bio: string
}

/**
 * Perfil intencionalmente ligero:
 * - nombre real obligatorio;
 * - bio completamente opcional;
 * - si hay bio, solo se limita su longitud máxima.
 */
export function faltasDelPerfil(datos: DatosPerfil): string[] {
  const faltas: string[] = []
  const bio = datos.bio.trim()

  if (datos.fullName.trim().length < 2) {
    faltas.push("escribe tu nombre completo")
  }

  if (bio.length > PROFILE_LIMITS.BIO_MAX) {
    faltas.push(`la bio no puede superar ${PROFILE_LIMITS.BIO_MAX} caracteres`)
  }

  return faltas
}
