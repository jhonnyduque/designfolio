// lib/works/cover.ts

/**
 * Un proyecto puede empezar por un video. Como la portada se pinta con <img> o
 * con background-image, tomar el primer medio a ciegas deja un recuadro vacío.
 * Estas funciones eligen la primera imagen real y, si no hay ninguna, avisan de
 * que el proyecto es solo video para que la vista dibuje su propio marcador.
 */

type Medio = { url: string; type?: string | null }

const esImagen = (m: Medio) => !m.type || m.type.startsWith("image/")

/** La primera imagen del proyecto, o null si solo tiene video. */
export function coverUrl(medios: Medio[] | null | undefined): string | null {
  return medios?.find(esImagen)?.url ?? null
}

/** True cuando no hay ninguna imagen que mostrar pero sí hay algún medio. */
export function soloVideo(medios: Medio[] | null | undefined): boolean {
  return Boolean(medios?.length) && !medios!.some(esImagen)
}
