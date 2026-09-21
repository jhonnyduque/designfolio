"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Comment } from "@/types/comment"

type CommentsResponse = { comments: Comment[]; error?: string }
const COOLDOWN_SECONDS = 60

/** Estado reutilizable de comentarios; no consulta nada hasta que la superficie se abre. */
export function useComments(workId: string, enabled: boolean) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [postError, setPostError] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const fetchComments = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(workId)}/comments`, { signal: controller.signal })
      const data = await response.json() as CommentsResponse
      if (!response.ok) throw new Error(data.error ?? "No se pudieron cargar los comentarios.")
      setComments(data.comments)
      setLoadError(null)
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return
      setLoadError(cause instanceof Error ? cause.message : "Error de conexión")
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [workId])

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort()
      abortRef.current = null
      return
    }
    void fetchComments()
    return () => abortRef.current?.abort()
  }, [enabled, fetchComments])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = window.setTimeout(() => setCooldownSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldownSeconds])

  const post = useCallback(async (content: string, categories: string[]) => {
    setPosting(true)
    setPostError(null)
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(workId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setPostError(cause instanceof Error ? cause.message : "Error de conexión")
      return false
    } finally {
      setPosting(false)
    }
  }, [fetchComments, workId])

  return { comments, loading, posting, loadError, postError, cooldownSeconds, post, refresh: fetchComments }
}
