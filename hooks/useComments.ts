"use client"

import { useCallback, useEffect, useState } from "react"
import type { Comment } from "@/types/comment"

type CommentsResponse = { comments: Comment[]; error?: string }
const COOLDOWN_SECONDS = 60

export function useComments(workId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(workId)}/comments`)
      const data = await response.json() as CommentsResponse
      if (!response.ok) throw new Error(data.error ?? "No se pudieron cargar los comentarios.")
      setComments(data.comments)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión")
    } finally { setLoading(false) }
  }, [workId])

  useEffect(() => {
    void fetchComments()
    fetch("/api/auth/get-session")
      .then((response) => response.json())
      .then((session) => setIsAuthenticated(Boolean(session?.user)))
      .catch(() => setIsAuthenticated(false))
  }, [fetchComments])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setTimeout(() => setCooldownSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => clearTimeout(timer)
  }, [cooldownSeconds])

  const post = useCallback(async (content: string, categories: string[]) => {
    setPosting(true)
    setError(null)
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(workId)}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, categories }),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) {
        if (response.status === 429) setCooldownSeconds(COOLDOWN_SECONDS)
        throw new Error(data.error ?? "No se pudo publicar el comentario.")
      }
      setCooldownSeconds(COOLDOWN_SECONDS)
      await fetchComments()
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión")
      return false
    } finally { setPosting(false) }
  }, [workId, fetchComments])

  return { comments, loading, posting, error, isAuthenticated, cooldownSeconds, post, refresh: fetchComments }
}
