// hooks/useLike.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseLikeReturn {
  liked: boolean
  count: number
  toggle: () => void
  loading: boolean
}

export function useLike(workId: string, initialCount: number): UseLikeReturn {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  // Check if user already liked this work
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      supabase
        .from("likes")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("work_id", workId)
        .maybeSingle()
        .then(({ data }) => {
          setLiked(!!data)
        })
    })
  }, [workId, supabase])

  const toggle = useCallback(async () => {
    if (!userId || loading) return

    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => (wasLiked ? c - 1 : c + 1))
    setLoading(true)

    try {
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
    } catch {
      // Revert on error
      setLiked(wasLiked)
      setCount((c) => (wasLiked ? c + 1 : c - 1))
    } finally {
      setLoading(false)
    }
  }, [userId, liked, loading, workId, supabase])

  return { liked, count, toggle, loading }
}
