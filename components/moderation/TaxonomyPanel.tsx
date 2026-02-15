// components/moderation/TaxonomyPanel.tsx
"use client"

import { useState } from "react"
import { useTaxonomyAdmin } from "@/hooks/useTaxonomyAdmin"
import type { TaxonomyAdmin } from "@/types/taxonomy"

type Tab = "category" | "tag"
type Filter = "all" | "active" | "inactive" | "archived"
type Modal =
  | { type: "create" }
  | { type: "rename"; item: TaxonomyAdmin }
  | { type: "merge"; source: TaxonomyAdmin }
  | null

export function TaxonomyPanel() {
  const { items, loading, create, rename, toggle, archive, restore, merge, reorder } = useTaxonomyAdmin()

  const [tab, setTab] = useState<Tab>("category")
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<Modal>(null)
  const [input, setInput] = useState("")
  const [mergeTarget, setMergeTarget] = useState("")
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const tabItems = items.filter((i) => i.type === tab)

  const filtered = tabItems.filter((i) => {
    const matchSearch = !search.trim() || i.name.toLowerCase().includes(search.toLowerCase()) || i.slug.includes(search.toLowerCase())
    const matchFilter =
      filter === "all" ||
      (filter === "active" && i.is_active && !i.is_archived) ||
      (filter === "inactive" && !i.is_active && !i.is_archived) ||
      (filter === "archived" && i.is_archived)
    return matchSearch && matchFilter
  })

  const stats = {
    total: tabItems.length,
    active: tabItems.filter((i) => i.is_active && !i.is_archived).length,
    inactive: tabItems.filter((i) => !i.is_active && !i.is_archived).length,
    archived: tabItems.filter((i) => i.is_archived).length,
  }

  const mergeCandidates = tabItems.filter(
    (i) => !i.is_archived && i.is_active && (modal?.type === "merge" ? i.id !== modal.source.id : true)
  )

  function notify(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleCreate() {
    if (modal?.type !== "create" || !input.trim()) return
    setBusy(true)
    const r = await create(tab, input.trim())
    setBusy(false)
    if (r.success) { notify(`"${input.trim()}" creada`); setModal(null); setInput("") }
    else notify(`Error: ${r.error}`)
  }

  async function handleRename() {
    if (modal?.type !== "rename" || !input.trim()) return
    setBusy(true)
    const r = await rename(modal.item.id, input.trim())
    setBusy(false)
    if (r.success) { notify(`Renombrada: "${r.old_name}" → "${r.new_name}"`); setModal(null) }
    else notify(`Error: ${r.error}`)
  }

  async function handleMerge() {
    if (modal?.type !== "merge" || !mergeTarget) return
    setBusy(true)
    const r = await merge(modal.source.id, mergeTarget)
    setBusy(false)
    if (r.success) { notify(`Fusionada: "${r.source_name}" → "${r.target_name}" (${r.moved} movidas)`); setModal(null) }
    else notify(`Error: ${r.error}`)
  }

  async function handleToggle(item: TaxonomyAdmin) {
    setBusy(true)
    const r = await toggle(item.id, !item.is_active)
    setBusy(false)
    if (r.success) notify(`"${item.name}" ${!item.is_active ? "activada" : "desactivada"}`)
    else notify(`Error: ${r.error}`)
  }

  async function handleArchive(item: TaxonomyAdmin) {
    if (!confirm(`¿Archivar "${item.name}"? (${item.usage_count} obras)`)) return
    setBusy(true)
    const r = await archive(item.id)
    setBusy(false)
    if (r.success) notify(`"${item.name}" archivada`)
    else notify(`Error: ${r.error}`)
  }

  async function handleRestore(item: TaxonomyAdmin) {
    setBusy(true)
    const r = await restore(item.id)
    setBusy(false)
    if (r.success) notify(`"${item.name}" restaurada`)
    else notify(`Error: ${r.error}`)
  }

  async function handleReorder(item: TaxonomyAdmin, dir: "up" | "down") {
    setBusy(true)
    const r = await reorder(item.id, dir)
    setBusy(false)
    if (!r.success) notify(`Error: ${r.error}`)
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Taxonomía</h1>
          <p className="mt-1 text-sm text-gray-500">Administra categorías y tags del catálogo.</p>
        </div>
        <button
          onClick={() => { setModal({ type: "create" }); setInput("") }}
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nueva {tab === "category" ? "categoría" : "tag"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          { value: "category" as Tab, label: "Categorías" },
          { value: "tag" as Tab, label: "Tags" },
        ]).map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setFilter("all"); setSearch("") }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {([
          { label: "Total", value: stats.total, f: "all" as Filter },
          { label: "Activas", value: stats.active, f: "active" as Filter },
          { label: "Inactivas", value: stats.inactive, f: "inactive" as Filter },
          { label: "Archivadas", value: stats.archived, f: "archived" as Filter },
        ]).map((s) => (
          <button key={s.label} onClick={() => setFilter(s.f)}
            className={`p-3 rounded-lg border text-left transition-colors ${filter === s.f ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-gray-700">{toast}</p>
          <button onClick={() => setToast(null)} className="text-xs text-gray-400 hover:text-gray-600 ml-3">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {tab === "category" && <th className="text-center px-3 py-3 font-medium text-gray-500 w-16">Orden</th>}
              <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Uso</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Estado</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                {tab === "category" && (
                  <td className="px-3 py-3 text-center">
                    {!item.is_archived && (
                      <div className="flex flex-col items-center gap-0.5">
                        <button onClick={() => handleReorder(item, "up")} disabled={busy}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none">▲</button>
                        <span className="text-xs text-gray-400">{item.sort_order}</span>
                        <button onClick={() => handleReorder(item, "down")} disabled={busy}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none">▼</button>
                      </div>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className={item.is_archived ? "line-through text-gray-400" : "text-gray-900 font-medium"}>{item.name}</span>
                  {item.created_by_name && <p className="text-xs text-gray-400 mt-0.5">por {item.created_by_name}</p>}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.slug}</td>
                <td className="px-4 py-3 text-center"><span className="font-semibold text-gray-900">{item.usage_count}</span></td>
                <td className="px-4 py-3 text-center">
                  {item.is_archived ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Archivada</span>
                  ) : item.is_active ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Activa</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Inactiva</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {item.is_archived ? (
                      <button onClick={() => handleRestore(item)} disabled={busy}
                        className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50">Restaurar</button>
                    ) : (
                      <>
                        <button onClick={() => { setModal({ type: "rename", item }); setInput(item.name) }} disabled={busy}
                          className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50">Renombrar</button>
                        <button onClick={() => handleToggle(item)} disabled={busy}
                          className="px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50">
                          {item.is_active ? "Desactivar" : "Activar"}
                        </button>
                        <button onClick={() => { setModal({ type: "merge", source: item }); setMergeTarget("") }} disabled={busy}
                          className="px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50">Merge</button>
                        <button onClick={() => handleArchive(item)} disabled={busy}
                          className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50">Archivar</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={tab === "category" ? 6 : 5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No se encontraron {tab === "category" ? "categorías" : "tags"}
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
              Nueva {tab === "category" ? "categoría" : "tag"}
            </h3>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nombre..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
              autoFocus maxLength={50} onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
              <button onClick={handleCreate} disabled={busy || input.trim().length < 2}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
                {busy ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {modal?.type === "rename" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Renombrar &quot;{modal.item.name}&quot;</h3>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
              autoFocus onKeyDown={(e) => e.key === "Enter" && handleRename()} />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
              <button onClick={handleRename} disabled={busy || !input.trim()}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
                {busy ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {modal?.type === "merge" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Fusionar &quot;{modal.source.name}&quot;</h3>
            <p className="text-sm text-gray-500 mb-4">Todas las obras se moverán a la {tab === "category" ? "categoría" : "tag"} destino.</p>
            <select value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none">
              <option value="">Selecciona destino...</option>
              {mergeCandidates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.usage_count} obras)</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
              <button onClick={handleMerge} disabled={busy || !mergeTarget}
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {busy ? "Fusionando..." : "Fusionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
