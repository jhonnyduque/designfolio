// components/works/MyWorks.tsx
"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface MyWork {
  id: string
  title: string
  category: string
  images: { url: string }[]
  moderation_status: string
  archived: boolean
  likes_count: number
  comments_count: number
  created_at: string
  published_at: string | null
}

const STATUS_STYLES: Record<string, { label: string; style: string }> = {
  draft: { label: "Borrador", style: "bg-gray-100 text-gray-600" },
  pending_review: {
    label: "En revisión",
    style: "bg-amber-50 text-amber-700",
  },
  approved: { label: "Publicada", style: "bg-green-50 text-green-700" },
  rejected: { label: "Rechazada", style: "bg-red-50 text-red-600" },
}

export function MyWorks({ works: initialWorks }: { works: MyWork[] }) {
  const [works, setWorks] = useState(initialWorks)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    title: string
  } | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const supabase = createClient()

  const pending = works.filter((w) => w.moderation_status === "pending_review" && !w.archived)
  const approved = works.filter((w) => w.moderation_status === "approved" && !w.archived)
  const rejected = works.filter((w) => w.moderation_status === "rejected" && !w.archived)
  const archived = works.filter((w) => w.archived)

  const visibleWorks = showArchived
    ? archived
    : works.filter((w) => !w.archived)

  const handleArchive = useCallback(
    async (workId: string, archive: boolean) => {
      setActionLoading(workId)
      try {
        const { error } = await supabase.rpc("user_archive_work", {
          p_work_id: workId,
          p_archived: archive,
        })
        if (error) throw error
        setWorks((prev) =>
          prev.map((w) =>
            w.id === workId ? { ...w, archived: archive } : w
          )
        )
      } catch {
        // Silently fail
      } finally {
        setActionLoading(null)
      }
    },
    [supabase]
  )

  const handleDelete = useCallback(
    async (workId: string) => {
      setActionLoading(workId)
      try {
        const { error } = await supabase.rpc("user_delete_work", {
          p_work_id: workId,
        })
        if (error) throw error
        setWorks((prev) => prev.filter((w) => w.id !== workId))
      } catch {
        // Silently fail
      } finally {
        setActionLoading(null)
        setConfirmDelete(null)
      }
    },
    [supabase]
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis obras</h1>
          <p className="mt-1 text-sm text-gray-500">
            {works.filter((w) => !w.archived).length} obras · {archived.length} archivadas
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nueva Obra
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-green-600">{approved.length}</p>
          <p className="text-xs text-gray-500">Publicadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{pending.length}</p>
          <p className="text-xs text-gray-500">En revisión</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-red-500">{rejected.length}</p>
          <p className="text-xs text-gray-500">Rechazadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-gray-400">{archived.length}</p>
          <p className="text-xs text-gray-500">Archivadas</p>
        </div>
      </div>

      {/* Filter tabs - always visible */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            !showArchived
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300 text-gray-600 hover:border-gray-400"
          }`}
        >
          Activas ({works.filter((w) => !w.archived).length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            showArchived
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300 text-gray-600 hover:border-gray-400"
          }`}
        >
          Archivadas ({archived.length})
        </button>
      </div>

      {works.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">
            No has publicado ninguna obra aún.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Crear tu primera obra
          </Link>
        </div>
      )}

      {/* Works grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleWorks.map((work) => {
          const thumb = work.images?.[0]?.url ?? null
          const status =
            STATUS_STYLES[work.moderation_status] ?? STATUS_STYLES.draft
          const isApproved = work.moderation_status === "approved"
          const date = new Date(work.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })

          return (
            <article
              key={work.id}
              className={`group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 ${
                work.archived ? "opacity-60" : "hover:shadow-md"
              }`}
            >
              {/* Image - clickable if approved */}
              {isApproved && !work.archived ? (
                <Link href={`/dashboard/work/${work.id}`}>
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-300">—</span>
                      </div>
                    )}
                    <span
                      className={`absolute top-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-full ${status.style}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={work.title}
                      className="w-full h-full object-cover opacity-75"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-300">—</span>
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      work.archived
                        ? "bg-gray-100 text-gray-500"
                        : status.style
                    }`}
                  >
                    {work.archived ? "Archivada" : status.label}
                  </span>
                </div>
              )}

              <div className="p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {work.category}
                </span>
                <h3 className="mt-1 text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2">
                  {work.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>{date}</span>
                  {isApproved && !work.archived && (
                    <span className="flex items-center gap-2">
                      <span>♥ {work.likes_count}</span>
                      <span>💬 {work.comments_count}</span>
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
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
            </article>
          )
        })}
      </div>

      {visibleWorks.length === 0 && works.length > 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-400">
            {showArchived
              ? "No tienes obras archivadas"
              : "Todas tus obras están archivadas"}
          </p>
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
              Esta acción no se puede deshacer. Se eliminarán también sus likes y
              comentarios.
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