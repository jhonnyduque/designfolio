"use client"

import { useCallback, useEffect, useState } from "react"
import type { Notification } from "@/types/notification"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications")
      if (response.status === 401) { setNotifications([]); return }
      const data = await response.json() as { notifications?: Notification[]; error?: string }
      if (!response.ok) throw new Error(data.error ?? "No se pudieron cargar las notificaciones.")
      setNotifications(data.notifications ?? [])
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión")
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const markAsRead = useCallback(async (ids: string[]) => {
    const response = await fetch("/api/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
    if (!response.ok) throw new Error("No se pudieron marcar las notificaciones.")
    const now = new Date().toISOString()
    setNotifications((previous) => previous.map((item) => ids.includes(item.id) ? { ...item, read_at: now } : item))
  }, [])

  const markAllRead = useCallback(async () => {
    const response = await fetch("/api/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: "all" }),
    })
    if (!response.ok) throw new Error("No se pudieron marcar las notificaciones.")
    const now = new Date().toISOString()
    setNotifications((previous) => previous.map((item) => item.read_at ? item : { ...item, read_at: now }))
  }, [])

  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.read_at).length,
    loading, error, markAsRead, markAllRead, refresh,
  }
}
