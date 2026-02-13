// hooks/useModeration.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  ModerationWork,
  ModerationResult,
  ModerationLogEntry,
} from "@/types/moderation"

interface UseModerationReturn {
  queue: ModerationWork[]
  history: ModerationLogEntry[]
  loading: boolean
  error: string | null
  stats: { pending: number; approved: number; rejected: number }
  approve: (workId: string) => Promise<ModerationResult>
  reject: (workId: string, note: string) => Promise<ModerationResult>
  refresh: () => void
}

export function useModeration(): UseModerationReturn {
  const [queue, setQueue] = useState<ModerationWork[]>([])
  const [history, setHistory] = useState<ModerationLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })

  const supabase = createClient()

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: works, error: worksErr } = await supabase
        .from("works")
        .select(`
          id,
          author_id,
          title,
          description,
          category,
          tags,
          images,
          moderation_status,
          created_at,
          published_at,
          profiles!works_author_id_fkey (
            username,
            full_name,
            avatar_url,
            reputation_level
          )
        `)
        .eq("moderation_status", "pending_review")
        .order("created_at", { ascending: true })

      if (worksErr) throw worksErr

      const mapped: ModerationWork[] = (works ?? []).map((w: any) => ({
        id: w.id,
        author_id: w.author_id,
        title: w.title,
        description: w.description,
        category: w.category,
        tags: w.tags,
        images: w.images ?? [],
        moderation_status: w.moderation_status,
        created_at: w.created_at,
        published_at: w.published_at,
        author_username: w.profiles?.username ?? "",
        author_full_name: w.profiles?.full_name ?? "Unknown",
        author_avatar_url: w.profiles?.avatar_url ?? null,
        author_reputation_level: w.profiles?.reputation_level ?? 0,
      }))

      setQueue(mapped)

      // Stats
      const { count: pendingCount } = await supabase
        .from("works")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "pending_review")

      const { count: approvedCount } = await supabase
        .from("works")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "approved")

      const { count: rejectedCount } = await supabase
        .from("works")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "rejected")

      setStats({
        pending: pendingCount ?? 0,
        approved: approvedCount ?? 0,
        rejected: rejectedCount ?? 0,
      })

      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .in("type", ["work_approved", "work_rejected"])
        .order("created_at", { ascending: false })
        .limit(20)

      setHistory((notifs ?? []) as ModerationLogEntry[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la cola")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const approve = useCallback(
    async (workId: string): Promise<ModerationResult> => {
      const { data, error: rpcErr } = await supabase.rpc("moderate_work", {
        p_work_id: workId,
        p_action: "approve",
        p_note: null,
      })

      if (rpcErr) return { success: false, error: rpcErr.message }

      const result = data as ModerationResult

      if (result.success) {
        setQueue((prev) => prev.filter((w) => w.id !== workId))
        setStats((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        }))

        // ✅ CORREGIDO: sin .catch()
        const { error: refreshErr } = await supabase.rpc("refresh_feed_scores")
        if (refreshErr) {
          console.warn("refresh_feed_scores no disponible:", refreshErr.message)
        }
      }

      return result
    },
    [supabase]
  )

  const reject = useCallback(
    async (workId: string, note: string): Promise<ModerationResult> => {
      const { data, error: rpcErr } = await supabase.rpc("moderate_work", {
        p_work_id: workId,
        p_action: "reject",
        p_note: note,
      })

      if (rpcErr) return { success: false, error: rpcErr.message }

      const result = data as ModerationResult

      if (result.success) {
        setQueue((prev) => prev.filter((w) => w.id !== workId))
        setStats((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          rejected: prev.rejected + 1,
        }))
      }

      return result
    },
    [supabase]
  )

  return {
    queue,
    history,
    loading,
    error,
    stats,
    approve,
    reject,
    refresh: fetchQueue,
  }
}
