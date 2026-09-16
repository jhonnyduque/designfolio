// components/moderation/WorksManager.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import {
  getAdminWorksAction,
  setWorkArchivedAction,
  adminDeleteWorkAction,
} from "@/lib/server/actions/admin"

interface WorkRow {
  id: string
  title: string
  category: string
  images: { url: string }[] | null
  moderation_status: string
  archived: boolean
  likes_count: number
  comments_count: number
  created_at: string
  author_name: string
  author_username: string
}

type Filter = "all" | "approved" | "archived"

export function WorksManager() {
  const [works, setWorks] = useState<WorkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("approved")
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    title: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchWorks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // "all" trae todo; el filtrado por estado se aplica más abajo en cliente.
      setWorks(await getAdminWorksAction("all"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los proyectos.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorks()
  }, [fetchWorks])

  const handleArchive = useCallback(
    async (workId: string, archived: boolean) => {
      setActionLoading(workId)
      setError(null)
      const result = await setWorkArchivedAction(workId, archived)
      if (result.success) {
        setWorks((prev) => prev.map((w) => (w.id === workId ? { ...w, archived } : w)))
      } else {
        setError(result.error ?? "No se pudo archivar el proyecto.")
      }
      setActionLoading(null)
    },
    []
  )

  const handleDelete = useCallback(
    async (workId: string) => {
      setActionLoading(workId)
      setError(null)
      const result = await adminDeleteWorkAction(workId)
      if (result.success) {
        setWorks((prev) => prev.filter((w) => w.id !== workId))
      } else {
        setError(result.error ?? "No se pudo eliminar el proyecto.")
      }
      setActionLoading(null)
      setConfirmDelete(null)
    },
    []
  )

  // Apply filters
  let filtered = works
  if (filter === "approved") {
    filtered = works.filter(
      (w) => w.moderation_status === "approved" && !w.archived
    )
  } else if (filter === "archived") {
    filtered = works.filter((w) => w.archived)
  }

  if (search) {
    filtered = filtered.filter(
      (w) =>
        w.title.toLowerCase().includes(search.toLowerCase()) ||
        w.author_name.toLowerCase().includes(search.toLowerCase())
    )
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2">
          {(
            [
              ["approved", "Publicadas"],
              ["archived", "Archivadas"],
              ["all", "Todas"],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                filter === key
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
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
            placeholder="Buscar por título o autor..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
          />
        </div>
      </div>

      {/* Works list */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">Cargando obras...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((work) => {
            const thumb = work.images?.[0]?.url ?? null
            return (
              <div
                key={work.id}
                className={`p-4 ${work.archived ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        —
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {work.title}
                      </p>
                      {work.archived && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-semibold">
                          ARCHIVADA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {work.author_name} · @{work.author_username} ·{" "}
                      {work.category}
                    </p>
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                      <span>♥ {work.likes_count}</span>
                      <span>💬 {work.comments_count}</span>
                      <span>
                        {new Date(work.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {work.archived ? (
                      <button
                        onClick={() => handleArchive(work.id, false)}
                        disabled={actionLoading === work.id}
                        className="text-xs text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                      >
                        Restaurar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(work.id, true)}
                        disabled={actionLoading === work.id}
                        className="text-xs text-amber-600 hover:text-amber-700 px-2 py-1 rounded hover:bg-amber-50 transition-colors"
                      >
                        Archivar
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setConfirmDelete({ id: work.id, title: work.title })
                      }
                      disabled={actionLoading === work.id}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No hay obras en esta categoría</p>
            </div>
          )}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900">
              ¿Eliminar &ldquo;{confirmDelete.title}&rdquo;?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Esta acción no se puede deshacer. Se eliminarán también todos sus
              likes y comentarios.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
