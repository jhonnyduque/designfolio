// lib/supabase/storage.ts
import { createClient } from "./client"
import type { WorkImage } from "@/types/work"
import { WORK_LIMITS } from "@/types/work"

interface UploadResult {
  image: WorkImage
  error: null
}

interface UploadError {
  image: null
  error: string
}

/**
 * Extrae dimensiones de un archivo de imagen/video antes de subir.
 * Necesario para el campo images JSONB en works.
 */
function getMediaDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  if (file.type.startsWith("video/")) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight })
        URL.revokeObjectURL(video.src)
      }
      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        reject(new Error("No se pudo leer el video"))
      }
      video.src = URL.createObjectURL(file)
    })
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error("No se pudo leer la imagen"))
    }
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Sube una imagen al bucket 'works' de Supabase Storage.
 * Path: works/{userId}/{workId}/{order}-{timestamp}.{ext}
 * Retorna la URL pública y metadatos para el JSONB.
 */
export async function uploadWorkImage(
  file: File,
  userId: string,
  workId: string,
  order: number
): Promise<UploadResult | UploadError> {
  const isVideo = file.type.startsWith("video/")
  const maxSize = isVideo
    ? WORK_LIMITS.VIDEO_MAX_SIZE_BYTES
    : WORK_LIMITS.IMAGE_MAX_SIZE_BYTES
  const maxSizeMb = isVideo
    ? WORK_LIMITS.VIDEO_MAX_SIZE_MB
    : WORK_LIMITS.IMAGE_MAX_SIZE_MB

  // Validar tamaño
  if (file.size > maxSize) {
    return {
      image: null,
      error: `${isVideo ? "El video" : "La imagen"} supera ${maxSizeMb}MB`,
    }
  }

  // Validar tipo
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ]
  if (!validTypes.includes(file.type)) {
    return {
      image: null,
      error: "Formato no soportado. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV",
    }
  }

  try {
    // Obtener dimensiones
    const { width, height } = await getMediaDimensions(file)

    // Generar nombre único
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${order}-${Date.now()}.${ext}`
    const path = `${userId}/${workId}/${fileName}`

    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from("works")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("works").getPublicUrl(path)

    return {
      image: {
        url: publicUrl,
        width,
        height,
        type: file.type,
        order,
      },
      error: null,
    }
  } catch (err) {
    return {
      image: null,
      error: err instanceof Error ? err.message : "Error al subir la imagen",
    }
  }
}

/**
 * Sube múltiples imágenes en paralelo.
 * Retorna las que se subieron exitosamente + errores.
 */
export async function uploadWorkImages(
  files: File[],
  userId: string,
  workId: string
): Promise<{ images: WorkImage[]; errors: string[] }> {
  const results = await Promise.all(
    files.map((file, i) => uploadWorkImage(file, userId, workId, i))
  )

  const images: WorkImage[] = []
  const errors: string[] = []

  for (const result of results) {
    if (result.image) images.push(result.image)
    if (result.error) errors.push(result.error)
  }

  // Ordenar por order
  images.sort((a, b) => a.order - b.order)

  return { images, errors }
}
