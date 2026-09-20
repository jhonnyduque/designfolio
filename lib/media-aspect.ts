const DEFAULT_MEDIA_ASPECT_RATIO = "4 / 5"

/**
 * Convierte dimensiones persistidas en una proporción CSS segura.
 * Los medios antiguos o incompletos conservan el ratio histórico del feed.
 */
export function mediaAspectRatio(width: number | null | undefined, height: number | null | undefined) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || !width || !height || width < 1 || height < 1) {
    return DEFAULT_MEDIA_ASPECT_RATIO
  }

  return `${width} / ${height}`
}
