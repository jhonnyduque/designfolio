// hooks/useLike.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseLikeReturn {
  liked: boolean
  count: number
  toggle: () => void
  loading: boolean
  error: string | null
}

export function useLike(workId: string, initialCount: number): UseLikeReturn {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const supabase = createClient()

  function getOrCreateVisitorId() {
    const key = "df_visitor_id"
    const existing =
      typeof window !== "undefined" ? window.localStorage.getItem(key) : null
    if (existing) return existing
    const created =
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`) ?? ""
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, created)
    }
    return created
  }

  // Check if user already liked this work
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        const { data } = await supabase
          .from("likes")
          .select("user_id")
          .eq("user_id", user.id)
          .eq("work_id", workId)
          .maybeSingle()
        setLiked(!!data)
        return
      }

      const vId = getOrCreateVisitorId()
      setVisitorId(vId)

      // Public anonymous likes (if table exists)
      const { data } = await supabase
        .from("public_likes")
        .select("id")
        .eq("visitor_id", vId)
        .eq("work_id", workId)
        .maybeSingle()

      setLiked(!!data)
    })
  }, [workId, supabase])

  const toggle = useCallback(async () => {
    if (loading) return
    setError(null)

    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => (wasLiked ? c - 1 : c + 1))
    setLoading(true)

    try {
      if (userId) {
        if (wasLiked) {
          const { error } = await supabase
            .from("likes")
            .delete()
            .eq("user_id", userId)
            .eq("work_id", workId)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from("likes")
            .insert({ user_id: userId, work_id: workId })

          if (error) throw error
        }
      } else {
        const vId = visitorId ?? getOrCreateVisitorId()
        if (!visitorId) setVisitorId(vId)
        if (wasLiked) {
          const { error } = await supabase
            .from("public_likes")
            .delete()
            .eq("visitor_id", vId)
            .eq("work_id", workId)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from("public_likes")
            .insert({ visitor_id: vId, work_id: workId })

          if (error) throw error
        }
      }
    } catch {
      // Revert on error
      setLiked(wasLiked)
      setCount((c) => (wasLiked ? c + 1 : c - 1))
      setError("No se pudo guardar tu like. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }, [userId, visitorId, liked, loading, workId, supabase])

  return { liked, count, toggle, loading, error }
}
