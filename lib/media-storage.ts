import path from "path"
import { ALLOWED_MEDIA_TYPES } from "@/lib/media"

/**
 * Raíz del almacenamiento de medios.
 *
 * Vive FUERA del directorio de la aplicación a propósito: en Hostinger cada
 * despliegue reemplaza la carpeta de la app, así que cualquier cosa guardada
 * dentro se perdería. Con `MEDIA_ROOT` apuntando, por ejemplo, a
 * `/home/<usuario>/designfolio-media`, los archivos sobreviven a los despliegues.
 *
 * En local, sin `MEDIA_ROOT`, se usa `.media/` en la raíz del proyecto —también
 * fuera de `public/`, para que desarrollo y producción se comporten igual.
 */
export function getMediaRoot(): string {
  // turbopackIgnore: la ruta se resuelve en tiempo de ejecución a propósito.
  // Sin esto, el análisis estático arrastra todo el proyecto al bundle servidor.
  const configured = process.env.MEDIA_ROOT?.trim()
  if (configured) return path.resolve(/* turbopackIgnore: true */ configured)
  return path.join(/* turbopackIgnore: true */ process.cwd(), ".media")
}

/** Prefijo público bajo el que se sirven los medios. */
export const MEDIA_URL_PREFIX = "/media"

const EXTENSION_TO_TYPE = new Map(
  Array.from(ALLOWED_MEDIA_TYPES, ([mime, extension]) => [extension, mime]),
)

export function contentTypeForPath(filePath: string): string | null {
  const extension = path.extname(filePath).slice(1).toLowerCase()
  return EXTENSION_TO_TYPE.get(extension) ?? null
}

/** Un segmento de ruta seguro: sin separadores, sin `..`, sin caracteres raros. */
const SAFE_SEGMENT = /^[A-Za-z0-9._-]{1,120}$/

/**
 * Convierte segmentos de URL en una ruta absoluta dentro de la raíz de medios.
 *
 * Devuelve null ante cualquier intento de salir de esa raíz. Se valida segmento
 * a segmento y además se comprueba el resultado final, porque la normalización
 * de rutas difiere entre sistemas y no conviene depender de una sola defensa.
 */
export function resolveMediaPath(segments: string[]): string | null {
  if (segments.length === 0 || segments.length > 8) return null
  if (!segments.every((segment) => SAFE_SEGMENT.test(segment) && segment !== "." && segment !== "..")) {
    return null
  }

  const root = getMediaRoot()
  const resolved = path.resolve(/* turbopackIgnore: true */ root, ...segments)
  const relative = path.relative(root, resolved)
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null

  return resolved
}

/** Ruta en disco donde se guardan los medios de un proyecto concreto. */
export function workMediaDirectory(userId: string, workId: string): string {
  return path.join(/* turbopackIgnore: true */ getMediaRoot(), userId, workId)
}

/** URL pública de un archivo ya guardado. */
export function mediaUrl(userId: string, workId: string, filename: string): string {
  return `${MEDIA_URL_PREFIX}/${userId}/${workId}/${filename}`
}
