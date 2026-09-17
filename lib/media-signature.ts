/**
 * Detección del tipo real de un archivo por su contenido.
 *
 * El `type` que llega en un `File` lo pone el navegador a partir de la extensión,
 * así que quien sube decide qué dice ser. Estas firmas leen los primeros bytes
 * del archivo, que sí describen lo que es de verdad.
 *
 * No convierte un archivo en seguro —un JPEG puede llevar carga maliciosa en sus
 * metadatos— pero impide lo más básico: colar un ejecutable o un HTML con script
 * diciendo que es una imagen.
 */

/** Bytes suficientes para identificar cualquiera de los formatos admitidos. */
export const SIGNATURE_BYTES = 32

const ascii = (text: string) => Array.from(text, (character) => character.charCodeAt(0))

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false
  return signature.every((byte, index) => bytes[offset + index] === byte)
}

/**
 * Las marcas de `ftyp` que usan MP4 y QuickTime. El recuadro `ftyp` empieza en el
 * byte 4; los cuatro anteriores son su longitud.
 */
const MP4_BRANDS = ["isom", "iso2", "mp41", "mp42", "avc1", "dash", "MSNV", "M4V "]
const MOV_BRANDS = ["qt  "]

function detectIsoMedia(bytes: Uint8Array): string | null {
  if (!startsWith(bytes, ascii("ftyp"), 4)) return null
  const brand = String.fromCharCode(...bytes.slice(8, 12))
  if (MOV_BRANDS.includes(brand)) return "video/quicktime"
  if (MP4_BRANDS.includes(brand)) return "video/mp4"
  // Marca desconocida pero contenedor válido: se trata como MP4, que es lo que
  // el reproductor intentará de todos modos.
  return "video/mp4"
}

/** Devuelve el tipo MIME real, o null si no se reconoce ninguno admitido. */
export function detectMediaType(bytes: Uint8Array): string | null {
  // JPEG
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg"

  // PNG
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png"

  // GIF87a / GIF89a
  if (startsWith(bytes, ascii("GIF87a")) || startsWith(bytes, ascii("GIF89a"))) return "image/gif"

  // WebP: contenedor RIFF con la marca WEBP en el byte 8
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) return "image/webp"

  // WebM / Matroska
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return "video/webm"

  // MP4 y QuickTime
  const isoMedia = detectIsoMedia(bytes)
  if (isoMedia) return isoMedia

  return null
}

/**
 * Comprueba que el contenido corresponde al tipo declarado.
 *
 * Devuelve un mensaje de error, o null si todo encaja. MP4 y QuickTime se
 * aceptan mutuamente: comparten contenedor y los navegadores etiquetan los `.mov`
 * de forma inconsistente.
 */
export function verifyDeclaredType(bytes: Uint8Array, declaredType: string): string | null {
  const actualType = detectMediaType(bytes)

  if (!actualType) {
    return "No se reconoce el contenido del archivo. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV."
  }

  if (actualType === declaredType) return null

  const isoPair = new Set(["video/mp4", "video/quicktime"])
  if (isoPair.has(actualType) && isoPair.has(declaredType)) return null

  return "El contenido del archivo no coincide con su formato declarado."
}
