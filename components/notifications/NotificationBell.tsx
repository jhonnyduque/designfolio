// components/notifications/NotificationBell.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "@/types/notification"

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "ahora"
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}sem`
}

function getNotificationContent(n: Notification): {
  icon: string
  text: string
  href: string | null
} {
  switch (n.type) {
    case "like":
      return {
        icon: "❤️",
        text: `${n.payload.liker_name ?? "Alguien"} le dio like a "${n.payload.work_title ?? "tu obra"}"`,
        href: n.target_id ? `/dashboard/work/${n.target_id}` : null,
      }
    case "comment":
      return {
        icon: "💬",
        text: `${n.payload.commenter_name ?? "Alguien"} comentó en "${n.payload.work_title ?? "tu obra"}"`,
        href: n.target_id ? `/dashboard/work/${n.target_id}` : null,
      }
    case "work_approved":
      return {
        icon: "✅",
        text: `Tu obra "${n.payload.work_title ?? ""}" fue aprobada`,
        href: n.target_id ? `/dashboard/work/${n.target_id}` : null,
      }
    case "work_rejected":
      return {
        icon: "❌",
        text: `Tu obra "${n.payload.work_title ?? ""}" fue rechazada${
          n.payload.note ? `: ${n.payload.note}` : ""
        }`,
        href: "/dashboard/my-works",
      }
    default:
      return {
        icon: "🔔",
        text: "Nueva notificación",
        href: null,
      }
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllRead } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Mark visible unread notifications as read when panel opens
  useEffect(() => {
    if (open && unreadCount > 0) {
      const unreadIds = notifications
        .filter((n) => !n.read_at)
        .slice(0, 20)
        .map((n) => n.id)
      if (unreadIds.length > 0) {
        // Small delay so user sees unread state briefly
        const timer = setTimeout(() => markAsRead(unreadIds), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [open, unreadCount, notifications, markAsRead])

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificaciones"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Marcar todo leído
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-100 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-full bg-gray-100 rounded" />
                      <div className="h-2.5 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">
                  No tienes notificaciones aún.
                </p>
              </div>
            )}

            {!loading &&
              notifications.map((n) => {
                const { icon, text, href } = getNotificationContent(n)
                const isUnread = !n.read_at

                const content = (
                  <div
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isUnread ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          isUnread
                            ? "text-gray-900 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {text}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {getTimeAgo(n.created_at)}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                )

                return href ? (
                  <Link
                    key={n.id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
