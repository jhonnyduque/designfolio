// hooks/useCreateWork.ts
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uploadWorkImages } from "@/lib/supabase/storage"
import type { CreateWorkPayload } from "@/types/work"

type PublishStep = "idle" | "uploading" | "saving" | "done" | "error"

interface UseCreateWorkReturn {
  publish: (files: File[], payload: Omit<CreateWorkPayload, "images">) => Promise<void>
  step: PublishStep
  progress: string
  error: string | null
  reset: () => void
}

export function useCreateWork(): UseCreateWorkReturn {
  const [step, setStep] = useState<PublishStep>("idle")
  const [progress, setProgress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const reset = useCallback(() => {
    setStep("idle")
    setProgress("")
    setError(null)
  }, [])

  const publish = useCallback(
    async (files: File[], payload: Omit<CreateWorkPayload, "images">) => {
      setError(null)

      try {
        // 1. Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("No autenticado")

        // 2. Generate work ID upfront (needed for storage path)
        const workId = crypto.randomUUID()

        // 3. Upload images
        setStep("uploading")
        setProgress(`Subiendo ${files.length} imagen${files.length > 1 ? "es" : ""}...`)

        const { images, errors: uploadErrors } = await uploadWorkImages(
          files,
          user.id,
          workId
        )

        if (images.length === 0) {
          throw new Error(
            uploadErrors.length > 0
              ? uploadErrors[0]
              : "No se pudo subir ninguna imagen"
          )
        }

        // 4. Insert work
        setStep("saving")
        setProgress("Guardando obra...")

        // Beta: level 0-1 → pending_review, level 2+ → approved (auto-approve)
        // For now, default to pending_review. Auto-approve requires checking
        // user_reputation which would need a server function.
        // TODO: Check reputation_level for auto-approve via RPC or server action.
        const moderationStatus = "pending_review"

        const { error: insertError } = await supabase.from("works").insert({
          id: workId,
          author_id: user.id,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          tags: payload.tags.length > 0 ? payload.tags : null,
          images: images,
          moderation_status: moderationStatus,
        })

        if (insertError) throw insertError

        setStep("done")
        setProgress(
          moderationStatus === "approved"
            ? "¡Publicado!"
            : "Enviado a revisión"
        )

        // Redirect after brief delay so user sees success
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
      } catch (err) {
        setStep("error")
        setError(err instanceof Error ? err.message : "Error al publicar")
      }
    },
    [supabase, router]
  )

  return { publish, step, progress, error, reset }
}
