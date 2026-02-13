// lib/supabase/avatar.ts
import { createClient } from "./client"
import { PROFILE_LIMITS } from "@/types/profile"

/**
 * Sube avatar al bucket 'avatars'.
 * Path: avatars/{userId}/avatar-{timestamp}.{ext}
 * Retorna la URL pública o un error.
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  if (file.size > PROFILE_LIMITS.AVATAR_MAX_SIZE_BYTES) {
    return { url: null, error: `La imagen supera ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB` }
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!validTypes.includes(file.type)) {
    return { url: null, error: "Formato no soportado. Usa JPG, PNG o WebP" }
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const path = `${userId}/avatar-${Date.now()}.${ext}`

    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { cacheControl: "3600", upsert: true })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path)

    return { url: publicUrl, error: null }
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err.message : "Error al subir el avatar",
    }
  }
}
