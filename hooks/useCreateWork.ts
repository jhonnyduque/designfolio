"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uploadWorkImages } from "@/lib/supabase/storage"
import type { CreateWorkPayload } from "@/types/work"
import { WORK_LIMITS } from "@/types/work"
import { normalizeSlug, slugifyProjectTitle } from "@/lib/slug"

type PublishStep = "idle" | "uploading" | "saving" | "done" | "error"
type ModerationStatus = "pending_review" | "approved"

interface UseCreateWorkReturn {
  publish: (
    files: File[],
    payload: Omit<CreateWorkPayload, "images">
  ) => Promise<string | null>
  step: PublishStep
  progress: string
  error: string | null
  wasAutoApproved: boolean
  reset: () => void
}

function buildDetailedError(err: unknown): string {
  const anyErr = err as
    | { code?: string; message?: string; details?: string; hint?: string }
    | null

  if (anyErr?.code === "23505" && anyErr?.message?.includes("works_slug_key")) {
    return "No se pudo publicar: el slug ya existe.\n\nSolución: cambia el campo Slug por uno único."
  }

  if (
    anyErr?.message?.toLowerCase().includes("mime type") ||
    anyErr?.message?.toLowerCase().includes("not allowed")
  ) {
    return "No se pudo publicar: formato de archivo no permitido por Storage.\n\nRevisa que Supabase acepte JPG, PNG, WebP, GIF, MP4, WebM, MOV."
  }

  if (
    anyErr?.message?.toLowerCase().includes("network") ||
    anyErr?.message?.toLowerCase().includes("fetch") ||
    anyErr?.message?.toLowerCase().includes("failed to fetch")
  ) {
    return "No se pudo publicar: error de conexión.\n\nVerifica internet o intenta de nuevo en unos segundos."
  }

  if (anyErr?.code === "23514") {
    return `No se pudo publicar: un dato no cumple las reglas de validación en base de datos.\n\nDetalle técnico: ${anyErr.message ?? "CHECK constraint"}.`
  }

  if (err instanceof Error && err.message) return err.message

  return "No se pudo publicar por una causa no identificada.\n\nPosibles causas:\n- Slug duplicado\n- Archivo con formato o peso no permitido\n- Problema de conexión con Supabase\n- Regla de seguridad (RLS) bloqueando la operación"
}

export function useCreateWork(): UseCreateWorkReturn {
  const [step, setStep] = useState<PublishStep>("idle")
  const [progress, setProgress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [wasAutoApproved, setWasAutoApproved] = useState(false)
  const supabase = createClient()

  const reset = useCallback(() => {
    setStep("idle")
    setProgress("")
    setError(null)
    setWasAutoApproved(false)
  }, [])

  const publish = useCallback(
    async (
      files: File[],
      payload: Omit<CreateWorkPayload, "images">
    ): Promise<string | null> => {
      setError(null)

      try {
        if (files.length < WORK_LIMITS.IMAGES_MIN) {
          throw new Error(`Debes subir al menos ${WORK_LIMITS.IMAGES_MIN} archivo.`)
        }
        if (files.length > WORK_LIMITS.IMAGES_MAX) {
          throw new Error(`Solo puedes subir hasta ${WORK_LIMITS.IMAGES_MAX} archivos.`)
        }
        if (payload.title.trim().length < WORK_LIMITS.TITLE_MIN) {
          throw new Error("El título es obligatorio.")
        }
        if (payload.title.trim().length > WORK_LIMITS.TITLE_MAX) {
          throw new Error(`El título supera el máximo de ${WORK_LIMITS.TITLE_MAX} caracteres.`)
        }
        if (payload.description.trim().length < WORK_LIMITS.DESCRIPTION_MIN) {
          throw new Error(
            `La descripción debe tener al menos ${WORK_LIMITS.DESCRIPTION_MIN} caracteres.`
          )
        }
        if (!payload.category) {
          throw new Error("Selecciona una categoría antes de publicar.")
        }
        if (payload.tags.length > WORK_LIMITS.TAGS_MAX) {
          throw new Error(`Solo puedes seleccionar hasta ${WORK_LIMITS.TAGS_MAX} tags.`)
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("No autenticado. Inicia sesión de nuevo.")

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_founder")
          .eq("id", user.id)
          .maybeSingle()

        const isFounder = profile?.is_founder === true
        const workId = crypto.randomUUID()

        const userSlugInput = normalizeSlug((payload.slug ?? "").trim())
        const slug =
          userSlugInput.length > 0
            ? userSlugInput
            : slugifyProjectTitle(payload.title)

        const { data: existingSlug } = await supabase
          .from("works")
          .select("id")
          .eq("slug", slug)
          .limit(1)
          .maybeSingle()

        if (existingSlug) {
          throw new Error(
            `No se pudo publicar: el slug "${slug}" ya existe.\n\nSolución: usa otro slug en el campo Slug.`
          )
        }

        setStep("uploading")
        setProgress(`Subiendo ${files.length} archivo${files.length > 1 ? "s" : ""}...`)

        const { images, errors: uploadErrors } = await uploadWorkImages(
          files,
          user.id,
          workId
        )

        if (images.length === 0) {
          throw new Error(
            uploadErrors.length > 0
              ? `No se pudo subir ningún archivo.\n\nDetalle: ${uploadErrors[0]}`
              : "No se pudo subir ningún archivo."
          )
        }

        if (uploadErrors.length > 0) {
          throw new Error(
            `La publicación falló porque algunos archivos no se pudieron subir.\n\nPrimer detalle: ${uploadErrors[0]}`
          )
        }

        setStep("saving")
        setProgress("Guardando proyecto...")

        const moderationStatus: ModerationStatus = isFounder
          ? "approved"
          : "pending_review"

        const { error: insertError } = await supabase.from("works").insert({
          id: workId,
          slug,
          author_id: user.id,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          tags: payload.tags.length > 0 ? payload.tags : null,
          images,
          moderation_status: moderationStatus,
          published_at:
            moderationStatus === "approved" ? new Date().toISOString() : null,
        })
        if (insertError) throw insertError

        if (payload.category) {
          const { data: categoryRes, error: categoryErr } = await supabase.rpc(
            "assign_category_to_work",
            {
              p_work_id: workId,
              p_category_name: payload.category,
            }
          )
          if (categoryErr) throw categoryErr
          if (categoryRes && categoryRes.success === false) {
            throw new Error(categoryRes.error ?? "No se pudo asignar la categoría.")
          }
        }

        if (payload.tags.length > 0) {
          const { data: tagsRes, error: tagsErr } = await supabase.rpc(
            "assign_tags_to_work",
            {
              p_work_id: workId,
              p_tag_names: payload.tags,
            }
          )
          if (tagsErr) throw tagsErr
          if (tagsRes && tagsRes.success === false) {
            throw new Error(tagsRes.error ?? "No se pudieron asignar los tags.")
          }
        }

        setStep("done")
        setWasAutoApproved(isFounder)
        setProgress(isFounder ? "Proyecto publicado" : "Enviado a revisión")
        return workId
      } catch (err) {
        setStep("error")
        setError(buildDetailedError(err))
        return null
      }
    },
    [supabase]
  )

  return { publish, step, progress, error, wasAutoApproved, reset }
}
