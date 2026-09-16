// hooks/useOnboarding.ts
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { OnboardingPayload } from "@/types/profile"

type Step = "idle" | "checking" | "uploading" | "saving" | "done" | "error"

interface UseOnboardingReturn {
  save: (payload: OnboardingPayload, avatarFile: File | null) => Promise<void>
  checkUsername: (username: string) => Promise<boolean>
  step: Step
  progress: string
  error: string | null
}

export function useOnboarding(): UseOnboardingReturn {
  const [step, setStep] = useState<Step>("idle")
  const [progress, setProgress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  /** Check if username is available (not taken by another user) */
  const checkUsername = useCallback(
    async (username: string): Promise<boolean> => {
      const response = await fetch(`/api/profile/username?value=${encodeURIComponent(username)}`)
      if (!response.ok) return false
      const data = await response.json() as { available?: boolean }
      return data.available === true
    },
    []
  )

  const save = useCallback(
    async (payload: OnboardingPayload, avatarFile: File | null) => {
      setError(null)

      try {
        // 1. Check username
        setStep("checking")
        setProgress("Verificando nombre de usuario...")
        const available = await checkUsername(payload.username)
        if (!available) {
          throw new Error("Ese nombre de usuario ya está en uso")
        }

        // 2. Upload avatar if provided
        let avatarUrl = payload.avatar_url
        if (avatarFile) {
          setStep("uploading")
          setProgress("Subiendo foto de perfil...")
          const formData = new FormData()
          formData.set("avatar", avatarFile)
          const upload = await fetch("/api/profile", { method: "POST", body: formData })
          if (!upload.ok) {
            const data = await upload.json().catch(() => ({})) as { error?: string }
            throw new Error(data.error ?? "No se pudo subir el avatar.")
          }
          avatarUrl = (await upload.json() as { url: string }).url
        }

        // 3. Update profile
        setStep("saving")
        setProgress("Guardando perfil...")

        const update = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: payload.username,
            fullName: payload.full_name,
            avatarUrl,
            bio: payload.bio,
            school: payload.school,
            careerYear: payload.career_year,
            categories: payload.categories,
          }),
        })
        if (!update.ok) {
          const data = await update.json().catch(() => ({})) as { error?: string }
          throw new Error(data.error ?? "No se pudo guardar el perfil.")
        }

        setStep("done")
        setProgress("¡Perfil completo!")

        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1000)
      } catch (err) {
        setStep("error")
        setError(err instanceof Error ? err.message : "Error al guardar")
      }
    },
    [router, checkUsername]
  )

  return { save, checkUsername, step, progress, error }
}
