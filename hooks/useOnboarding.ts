// hooks/useOnboarding.ts
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uploadAvatar } from "@/lib/supabase/avatar"
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
  const supabase = createClient()

  /** Check if username is available (not taken by another user) */
  const checkUsername = useCallback(
    async (username: string): Promise<boolean> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .maybeSingle()

      return data === null // true = available
    },
    [supabase]
  )

  const save = useCallback(
    async (payload: OnboardingPayload, avatarFile: File | null) => {
      setError(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("No autenticado")

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
          const result = await uploadAvatar(avatarFile, user.id)
          if (result.error) throw new Error(result.error)
          avatarUrl = result.url
        }

        // 3. Update profile
        setStep("saving")
        setProgress("Guardando perfil...")

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            username: payload.username,
            full_name: payload.full_name,
            avatar_url: avatarUrl,
            bio: payload.bio,
            school: payload.school,
            career_year: payload.career_year,
            categories: payload.categories,
            onboarding_completed: true,
          })
          .eq("id", user.id)

        if (updateError) throw updateError

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
    [supabase, router, checkUsername]
  )

  return { save, checkUsername, step, progress, error }
}
