// components/moderation/UsersManager.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserRow {
  id: string
  full_name: string
  username: string
  email_from_auth?: string
  avatar_url: string | null
  school: string | null
  is_active: boolean
  is_founder: boolean
  reputation_level: number
  created_at: string
  approved_count: number
  pending_count: number
  rejected_count: number
}

export function UsersManager() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    userId: string
    action: "deactivate" | "activate"
    name: string
  } | null>(null)
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, username, avatar_url, school, is_active, is_founder, reputation_level, created_at"
        )
        .order("created_at", { ascending: false })

      if (error) throw error

      // Fetch work counts per user
      const { data: works } = await supabase
        .from("works")
        .select("author_id, moderation_status")

      // Count works per user
      const counts: Record<
        string,
        { approved: number; pending: number; rejected: number }
      > = {}
      ;(works ?? []).forEach((w: any) => {
        if (!counts[w.author_id]) {
          counts[w.author_id] = { approved: 0, pending: 0, rejected: 0 }
        }
        if (w.moderation_status === "approved") counts[w.author_id].approved++
        else if (w.moderation_status === "pending_review")
          counts[w.author_id].pending++
        else if (w.moderation_status === "rejected")
          counts[w.author_id].rejected++
      })

      setUsers(
        (profiles ?? []).map((p: any) => ({
          ...p,
          approved_count: counts[p.id]?.approved ?? 0,
          pending_count: counts[p.id]?.pending ?? 0,
          rejected_count: counts[p.id]?.rejected ?? 0,
        }))
      )
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleActive = useCallback(
    async (userId: string, active: boolean) => {
      setActionLoading(userId)
      try {
        const { error } = await supabase.rpc("toggle_user_active", {
          p_user_id: userId,
          p_active: active,
        })
        if (error) throw error
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_active: active } : u
          )
        )
      } catch {
        // Silently fail
      } finally {
        setActionLoading(null)
        setConfirmAction(null)
      }
    },
    [supabase]
  )

  const filtered = search
    ? users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const activeCount = users.filter((u) => u.is_active).length
  const inactiveCount = users.filter((u) => !u.is_active).length

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Usuarios activos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{inactiveCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Inactivos</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuario..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
        />
      </div>

      {/* User list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                  <div className="h-2.5 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((user) => (
            <div
              key={user.id}
              className={`p-4 ${!user.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-500">
                        {user.full_name?.charAt(0) ?? "?"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.full_name}
                    </p>
                    <span className="text-xs text-gray-400">
                      @{user.username}
                    </span>
                    {user.is_founder && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                        FOUNDER
                      </span>
                    )}
                    {!user.is_active && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                        INACTIVO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {user.school ?? "Sin escuela"} · Miembro desde{" "}
                    {new Date(user.created_at).toLocaleDateString("es-ES", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {/* Work counts */}
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-green-600">
                      ✓ {user.approved_count} aprobadas
                    </span>
                    {user.pending_count > 0 && (
                      <span className="text-amber-600">
                        ⏳ {user.pending_count} pendientes
                      </span>
                    )}
                    {user.rejected_count > 0 && (
                      <span className="text-red-500">
                        ✗ {user.rejected_count} rechazadas
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!user.is_founder && (
                  <div className="flex-shrink-0">
                    {user.is_active ? (
                      <button
                        onClick={() =>
                          setConfirmAction({
                            userId: user.id,
                            action: "deactivate",
                            name: user.full_name,
                          })
                        }
                        disabled={actionLoading === user.id}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleToggleActive(user.id, true)
                        }
                        disabled={actionLoading === user.id}
                        className="text-xs text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                      >
                        Reactivar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">
                {search ? "No se encontraron usuarios" : "No hay usuarios registrados"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900">
              ¿Desactivar a {confirmAction.name}?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              El usuario no podrá acceder a la plataforma y sus obras dejarán de
              aparecer en el feed. Puedes reactivarlo después.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  handleToggleActive(confirmAction.userId, false)
                }
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
