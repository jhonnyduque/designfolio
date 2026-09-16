"use client"

import { useCallback, useEffect, useState } from "react"

interface LikeResponse { liked: boolean; count: number; error?: string }

export function useLike(workId: string, initialCount: number) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/works/${encodeURIComponent(workId)}/likes`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as LikeResponse
        if (!response.ok) throw new Error(data.error ?? "No se pudo consultar el like.")
        if (!controller.signal.aborted) { setLiked(data.liked); setCount(data.count) }
      })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Error de conexión") })
    return () => controller.abort()
  }, [workId])

  const toggle = useCallback(async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(workId)}/likes`, { method: "POST" })
      const data = await response.json() as LikeResponse
      if (!response.ok) throw new Error(data.error ?? "No se pudo guardar tu like.")
      setLiked(data.liked)
      setCount(data.count)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión")
    } finally { setLoading(false) }
  }, [loading, workId])

  return { liked, count, toggle, loading, error }
}
