// hooks/useNotifications.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/types/notification"

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (ids: string[]) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications((data ?? []) as Notification[])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read_at).length

  const markAsRead = useCallback(
    async (ids: string[]) => {
      try {
        await supabase.rpc("mark_notifications_read", { p_ids: ids })
        setNotifications((prev) =>
          prev.map((n) =>
            ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n
          )
        )
      } catch {
        // Silently fail
      }
    },
    [supabase]
  )

  const markAllRead = useCallback(async () => {
    try {
      await supabase.rpc("mark_all_notifications_read")
      setNotifications((prev) =>
        prev.map((n) =>
          n.read_at ? n : { ...n, read_at: new Date().toISOString() }
        )
      )
    } catch {
      // Silently fail
    }
  }, [supabase])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllRead,
    refresh: fetchNotifications,
  }
}
