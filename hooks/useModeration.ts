// hooks/useModeration.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getModerationQueueAction,
  getModerationStatsAction,
  getModerationHistoryAction,
  moderateWorkAction,
} from "@/lib/server/actions/moderation"
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

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [items, counts, log] = await Promise.all([
        getModerationQueueAction(),
        getModerationStatsAction(),
        getModerationHistoryAction(),
      ])
      setQueue(items)
      setStats(counts)
      setHistory(log)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la cola")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const moderate = useCallback(
    async (workId: string, action: "approve" | "reject", note?: string): Promise<ModerationResult> => {
      const result = await moderateWorkAction(workId, action, note)
      if (!result.success) return result

      setQueue((prev) => prev.filter((w) => w.id !== workId))
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: action === "approve" ? prev.approved + 1 : prev.approved,
        rejected: action === "reject" ? prev.rejected + 1 : prev.rejected,
      }))
      // El historial vive en moderation_log, así que se recarga tras cada decisión.
      getModerationHistoryAction().then(setHistory).catch(() => {})
      return result
    },
    [],
  )

  const approve = useCallback(
    (workId: string) => moderate(workId, "approve"),
    [moderate],
  )

  const reject = useCallback(
    (workId: string, note: string) => moderate(workId, "reject", note),
    [moderate],
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
