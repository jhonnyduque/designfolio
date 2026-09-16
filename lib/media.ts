import type { WorkImage } from "@/types/work"
import { WORK_LIMITS } from "@/types/work"

export const ALLOWED_MEDIA_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
])

export function validateMediaFile(file: File) {
  const extension = ALLOWED_MEDIA_TYPES.get(file.type)
  if (!extension) return "Formato no permitido. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV."
  const limit = file.type.startsWith("video/") ? WORK_LIMITS.VIDEO_MAX_SIZE_BYTES : WORK_LIMITS.IMAGE_MAX_SIZE_BYTES
  const limitMb = file.type.startsWith("video/") ? WORK_LIMITS.VIDEO_MAX_SIZE_MB : WORK_LIMITS.IMAGE_MAX_SIZE_MB
  if (file.size === 0) return "El archivo está vacío."
  if (file.size > limit) return `${file.type.startsWith("video/") ? "El video" : "La imagen"} supera el límite de ${limitMb}MB.`
  return null
}

export type UploadedMedia = WorkImage
