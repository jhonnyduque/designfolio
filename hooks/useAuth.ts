"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface SessionUser { id: string; email: string; name: string }

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/auth/get-session")
      .then((response) => response.json())
      .then((session) => setUser(session?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const signOut = useCallback(async () => {
    await fetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
    setUser(null)
    router.push("/login")
    router.refresh()
  }, [router])

  return { user, loading, signOut }
}
