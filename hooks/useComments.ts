// hooks/useComments.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Comment } from "@/types/comment"

interface UseCommentsReturn {
  comments: Comment[]
  loading: boolean
  posting: boolean
  error: string | null
  post: (content: string, categories: string[]) => Promise<boolean>
  refresh: () => void
}

export function useComments(workId: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchErr } = await supabase
        .from("comments")
        .select(`
          id,
          user_id,
          work_id,
          content,
          categories,
          is_valid,
          created_at,
          profiles!comments_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("work_id", workId)
        .order("created_at", { ascending: false })

      if (fetchErr) throw fetchErr

      const mapped: Comment[] = (data ?? []).map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        work_id: c.work_id,
        content: c.content,
        categories: c.categories,
        is_valid: c.is_valid,
        created_at: c.created_at,
        author_username: c.profiles?.username ?? "",
        author_full_name: c.profiles?.full_name ?? "Anónimo",
        author_avatar_url: c.profiles?.avatar_url ?? null,
      }))

      setComments(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar comentarios")
    } finally {
      setLoading(false)
    }
  }, [workId, supabase])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const post = useCallback(
    async (content: string, categories: string[]): Promise<boolean> => {
      setPosting(true)
      setError(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("No autenticado")

        const { error: insertErr } = await supabase.from("comments").insert({
          user_id: user.id,
          work_id: workId,
          content,
          categories,
        })

        if (insertErr) throw insertErr

        // Refresh to get the new comment with joined profile
        await fetchComments()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al publicar")
        return false
      } finally {
        setPosting(false)
      }
    },
    [workId, supabase, fetchComments]
  )

  return { comments, loading, posting, error, post, refresh: fetchComments }
}
