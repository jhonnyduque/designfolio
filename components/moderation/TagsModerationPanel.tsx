// components/moderation/TagsModerationPanel.tsx
"use client"

import { useState } from "react"
import { useTagsAdmin } from "@/hooks/useTagsAdmin"
import type { TagAdmin } from "@/types/tag"

type ModalAction =
  | { type: "rename"; tag: TagAdmin }
  | { type: "merge"; source: TagAdmin }
  | { type: "create" }
  | null

export function TagsModerationPanel() {
  const {
    tags,
    loading,
    error,
    refresh,
    createTag,
    renameTag,
    toggleTag,
    archiveTag,
    restoreTag,
    mergeTags,
  } = useTagsAdmin()

  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "archived">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [modal, setModal] = useState<ModalAction>(null)
  const [modalInput, setModalInput] = useState("")
  const [mergeTargetId, setMergeTargetId] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)

  // Filter tags
  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      !searchQuery.trim() ||
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.includes(searchQuery.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && tag.is_active && !tag.is_archived) ||
      (filter === "inactive" && !tag.is_active && !tag.is_archived) ||
      (filter === "archived" && tag.is_archived)

    return matchesSearch && matchesFilter
  })

  // Stats
  const stats = {
    total: tags.length,
    active: tags.filter((t) => t.is_active && !t.is_archived).length,
    inactive: tags.filter((t) => !t.is_active && !t.is_archived).length,
    archived: tags.filter((t) => t.is_archived).length,
  }

  // Merge candidates
  const mergeCandidates = tags.filter(
    (t) =>
      !t.is_archived &&
      t.is_active &&
      (modal?.type === "merge" ? t.id !== modal.source.id : true)
  )

  async function handleCreate() {
    if (modal?.type !== "create" || !modalInput.trim()) return
    setActionLoading(true)
    const result = await createTag(modalInput.trim())
    setActionLoading(false)
    if (result.success) {
      setActionResult(`Tag "${modalInput.trim()}" creada`)
      setModal(null)
      setModalInput("")
    } else {
      setActionResult(`Error: ${result.error}`)
    }
  }

  async function handleRename() {
    if (modal?.type !== "rename" || !modalInput.trim()) return
    setActionLoading(true)
    const result = await renameTag(modal.tag.id, modalInput.trim())
    setActionLoading(false)
    if (result.success) {
      setActionResult(`Renombrada: "${modal.tag.name}" → "${modalInput.trim()}"`)
      setModal(null)
    } else {
      setActionResult(`Error: ${result.error}`)
    }
  }

  async function handleMerge() {
    if (modal?.type !== "merge" || !mergeTargetId) return
    setActionLoading(true)
    const result = await mergeTags(modal.source.id, mergeTargetId)
    setActionLoading(false)
    if (result.success) {
      setActionResult(
        `Merge: "${result.source_name}" → "${result.target_name}" (${result.moved} movidas, ${result.duplicates_removed} duplicados)`
      )
      setModal(null)
    } else {
      setActionResult(`Error: ${result.error}`)
    }
  }

  async function handleToggle(tag: TagAdmin) {
    setActionLoading(true)
    const result = await toggleTag(tag.id, !tag.is_active)
    setActionLoading(false)
    if (result.success) {
      setActionResult(`"${tag.name}" ${!tag.is_active ? "activada" : "desactivada"}`)
    } else {
      setActionResult(`Error: ${result.error}`)
    }
  }

  async function handleArchive(tag: TagAdmin) {
    if (!confirm(`¿Archivar "${tag.name}"? (${tag.usage_count} obras la usan)`)) return
    setActionLoading(true)
    const result = await archiveTag(tag.id)
    setActionLoading(false)
    if (result.success) {
      setActionResult(`"${tag.name}" archivada`)
    } else {
      setActionResult(`Error: ${result.error}`)
    }
  }

  async function handleRestore(tag: TagAdmin) {
    setActionLoading(true)
    const result = await restoreTag(tag.id)
    setActionLoading(false)
    if (result.success) {
      setActionResult(`"${tag.name}" restaurada`)
    } else {
      setActionResult(`Error: ${result.error}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Moderación de Tags</h1>
          <p className="mt-1 text-sm text-gray-500">
            Crea, edita y modera las etiquetas del catálogo.
          </p>
        </div>
        <button
          onClick={() => {
            setModal({ type: "create" })
            setModalInput("")
          }}
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nueva Tag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, f: "all" as const },
          { label: "Activas", value: stats.active, f: "active" as const },
          { label: "Inactivas", value: stats.inactive, f: "inactive" as const },
          { label: "Archivadas", value: stats.archived, f: "archived" as const },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.f)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              filter === stat.f
                ? "border-gray-900 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar tags..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
        />
      </div>

      {/* Action result toast */}
      {actionResult && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-gray-700">{actionResult}</p>
          <button
            onClick={() => setActionResult(null)}
            className="text-xs text-gray-400 hover:text-gray-600 ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tags table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tag</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Uso</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Estado</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTags.map((tag) => (
              <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className={tag.is_archived ? "line-through text-gray-400" : "text-gray-900 font-medium"}>
                    {tag.name}
                  </span>
                  {tag.created_by_name && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      por {tag.created_by_name}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{tag.slug}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-gray-900">{tag.usage_count}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {tag.is_archived ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      Archivada
                    </span>
                  ) : tag.is_active ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                      Inactiva
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {tag.is_archived ? (
                      <button
                        onClick={() => handleRestore(tag)}
                        disabled={actionLoading}
                        className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      >
                        Restaurar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setModal({ type: "rename", tag })
                            setModalInput(tag.name)
                          }}
                          disabled={actionLoading}
                          className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                        >
                          Renombrar
                        </button>
                        <button
                          onClick={() => handleToggle(tag)}
                          disabled={actionLoading}
                          className="px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50"
                        >
                          {tag.is_active ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => {
                            setModal({ type: "merge", source: tag })
                            setMergeTargetId("")
                          }}
                          disabled={actionLoading}
                          className="px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                        >
                          Merge
                        </button>
                        <button
                          onClick={() => handleArchive(tag)}
                          disabled={actionLoading}
                          className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          Archivar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredTags.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No se encontraron tags
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {modal?.type === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Nueva Tag
            </h3>
            <input
              type="text"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              placeholder="Nombre de la tag..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
              autoFocus
              maxLength={50}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <p className="mt-1 text-xs text-gray-400">
              Los usuarios verán esta tag como opción al crear obras.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={actionLoading || modalInput.trim().length < 2}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {actionLoading ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {modal?.type === "rename" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Renombrar &quot;{modal.tag.name}&quot;
            </h3>
            <input
              type="text"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleRename}
                disabled={actionLoading || !modalInput.trim()}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {actionLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {modal?.type === "merge" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Fusionar &quot;{modal.source.name}&quot;
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Todas las obras con esta tag se moverán a la tag destino.
            </p>
            <select
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
            >
              <option value="">Selecciona tag destino...</option>
              {mergeCandidates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.usage_count} obras)
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleMerge}
                disabled={actionLoading || !mergeTargetId}
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading ? "Fusionando..." : "Fusionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
