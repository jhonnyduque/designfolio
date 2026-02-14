// components/auth/ClaimInviteCode.tsx
"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

/**
 * Silent component that claims an invite code stored in localStorage.
 * This handles the Google OAuth flow where the invite code can't be sent
 * through the OAuth redirect. The code is stored before redirect and
 * claimed here after the user returns.
 */
export function ClaimInviteCode() {
  const supabase = createClient()

  useEffect(() => {
    const code = localStorage.getItem("df_invite_code")
    if (!code) return

    async function claim() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      try {
        await supabase.rpc("claim_invite_code", {
          p_code: code,
          p_user_id: user.id,
        })
      } catch {
        // Silently fail — code may already be claimed or invalid
      } finally {
        localStorage.removeItem("df_invite_code")
      }
    }

    claim()
  }, [supabase])

  return null // Invisible component
}
