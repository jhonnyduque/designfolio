// hooks/useComments.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Comment } from "@/types/comment"

const ANON_COMMENT_COOLDOWN_SECONDS = 60

interface UseCommentsReturn {
  comments: Comment[]
  loading: boolean
  posting: boolean
  error: string | null
  isAuthenticated: boolean
  cooldownSeconds: number
  post: (content: string, categories: string[]) => Promise<boolean>
  refresh: () => void
}

export function useComments(workId: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
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

  function getCooldownKey(workIdParam: string, visitorId: string) {
    return `df_comment_cooldown_${workIdParam}_${visitorId}`
  }

  function startCooldown(workIdParam: string, visitorId: string) {
    const expiresAt = Date.now() + ANON_COMMENT_COOLDOWN_SECONDS * 1000
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getCooldownKey(workIdParam, visitorId), String(expiresAt))
    }
    setCooldownSeconds(ANON_COMMENT_COOLDOWN_SECONDS)
  }

  function getRemainingCooldown(workIdParam: string, visitorId: string) {
    if (typeof window === "undefined") return 0
    const raw = window.localStorage.getItem(getCooldownKey(workIdParam, visitorId))
    if (!raw) return 0
    const expiresAt = Number(raw)
    if (!Number.isFinite(expiresAt)) return 0
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  }

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

      const registered: Comment[] = (data ?? []).map((c: any) => ({
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
        source: "registered",
      }))

      // Public anonymous comments (if table exists)
      const { data: publicData, error: publicErr } = await supabase
        .from("public_comments")
        .select("id, visitor_id, work_id, content, categories, is_valid, created_at, visitor_name")
        .eq("work_id", workId)
        .order("created_at", { ascending: false })

      const anonymous: Comment[] = publicErr
        ? []
        : (publicData ?? []).map((c: any) => ({
            id: c.id,
            user_id: c.visitor_id ?? "public",
            work_id: c.work_id,
            content: c.content,
            categories: c.categories ?? [],
            is_valid: !!c.is_valid,
            created_at: c.created_at,
            author_username: "visitante",
            author_full_name: c.visitor_name ?? "Visitante",
            author_avatar_url: null,
            source: "public",
          }))

      const merged = [...registered, ...anonymous].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setComments(merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar comentarios")
    } finally {
      setLoading(false)
    }
  }, [workId, supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
      if (!user) {
        const visitorId = getOrCreateVisitorId()
        setCooldownSeconds(getRemainingCooldown(workId, visitorId))
      } else {
        setCooldownSeconds(0)
      }
    })
    fetchComments()
  }, [fetchComments, supabase])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const post = useCallback(
    async (content: string, categories: string[]): Promise<boolean> => {
      setPosting(true)
      setError(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        let insertErr: any = null

        if (user) {
          const { error } = await supabase.from("comments").insert({
            user_id: user.id,
            work_id: workId,
            content,
            categories,
          })
          insertErr = error
        } else {
          const visitorId = getOrCreateVisitorId()
          const remaining = getRemainingCooldown(workId, visitorId)
          if (remaining > 0) {
            setCooldownSeconds(remaining)
            throw new Error(`Espera ${remaining}s antes de comentar de nuevo.`)
          }
          const { error } = await supabase.from("public_comments").insert({
            visitor_id: visitorId,
            visitor_name: "Visitante",
            work_id: workId,
            content,
            categories,
          })
          insertErr = error
          if (!error) {
            startCooldown(workId, visitorId)
          }
        }

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

  return {
    comments,
    loading,
    posting,
    error,
    isAuthenticated,
    cooldownSeconds,
    post,
    refresh: fetchComments,
  }
}
