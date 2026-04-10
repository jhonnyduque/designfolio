// hooks/useCreateWork.ts
"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uploadWorkImages } from "@/lib/supabase/storage"
import type { CreateWorkPayload } from "@/types/work"
import { slugifyProjectTitle } from "@/lib/slug"

type PublishStep = "idle" | "uploading" | "saving" | "done" | "error"
type ModerationStatus = "pending_review" | "approved"

interface UseCreateWorkReturn {
  publish: (
    files: File[],
    payload: Omit<CreateWorkPayload, "images">
  ) => Promise<string | null>   // 🔥 CAMBIADO
  step: PublishStep
  progress: string
  error: string | null
  wasAutoApproved: boolean
  reset: () => void
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
    ): Promise<string | null> => {  // 🔥 CAMBIADO
      setError(null)

      try {
        // 1️⃣ Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error("No autenticado")

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_founder")
          .eq("id", user.id)
          .maybeSingle()

        const isFounder = profile?.is_founder === true

        // 2️⃣ Generate work ID
        const workId = crypto.randomUUID()

        // 3️⃣ Upload images
        setStep("uploading")
        setProgress(
          `Subiendo ${files.length} archivo${files.length > 1 ? "s" : ""}...`
        )

        const { images, errors: uploadErrors } =
          await uploadWorkImages(files, user.id, workId)

        if (images.length === 0) {
          throw new Error(
            uploadErrors.length > 0
              ? uploadErrors[0]
              : "No se pudo subir ninguna imagen"
          )
        }

        // 4️⃣ Insert work
        setStep("saving")
        setProgress("Guardando proyecto...")

        const moderationStatus: ModerationStatus = isFounder ? "approved" : "pending_review"
        const slug = slugifyProjectTitle(payload.title)

        const { error: insertError } = await supabase
          .from("works")
          .insert({
            id: workId,
            slug,
            author_id: user.id,
            title: payload.title,
            description: payload.description,
            category: payload.category,
            tags: payload.tags.length > 0 ? payload.tags : null,
            images: images,
            moderation_status: moderationStatus,
            published_at: moderationStatus === "approved" ? new Date().toISOString() : null,
          })

        if (insertError) throw insertError

        // 5️⃣ Assign taxonomy (category + tags) before finishing
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
            throw new Error(categoryRes.error ?? "No se pudo asignar categoría")
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
            throw new Error(tagsRes.error ?? "No se pudieron asignar tags")
          }
        }

        setStep("done")
        setWasAutoApproved(isFounder)
        setProgress(isFounder ? "Proyecto publicado" : "Enviado a revisión")

        return workId   // 🔥 AHORA SÍ DEVUELVE EL ID
      } catch (err) {
        setStep("error")
        const anyErr = err as { code?: string; message?: string } | null
        const duplicateSlug =
          anyErr?.code === "23505" &&
          (anyErr.message?.includes("works_slug_key") ||
            anyErr.message?.toLowerCase().includes("slug"))

        setError(
          duplicateSlug
            ? "Ese nombre de proyecto ya existe. Usa un título diferente."
            : err instanceof Error
              ? err.message
              : "Error al publicar"
        )
        return null    // 🔥 IMPORTANTE
      }
    },
    [supabase]
  )

  return { publish, step, progress, error, wasAutoApproved, reset }
}
