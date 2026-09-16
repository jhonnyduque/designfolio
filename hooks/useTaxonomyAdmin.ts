// hooks/useTaxonomyAdmin.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getTaxonomyAdminAction,
  createTaxonomyAction,
  renameTaxonomyAction,
  toggleTaxonomyAction,
  archiveTaxonomyAction,
  restoreTaxonomyAction,
  mergeTaxonomyAction,
  reorderTaxonomyAction,
} from "@/lib/server/actions/taxonomy-admin"
import type {
  TaxonomyAdmin,
  TaxonomyRpcResult,
  MergeTaxonomyResult,
} from "@/types/taxonomy"

interface UseTaxonomyAdminReturn {
  items: TaxonomyAdmin[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (type: string, name: string) => Promise<TaxonomyRpcResult>
  rename: (id: string, newName: string) => Promise<TaxonomyRpcResult>
  toggle: (id: string, isActive: boolean) => Promise<TaxonomyRpcResult>
  archive: (id: string) => Promise<TaxonomyRpcResult>
  restore: (id: string) => Promise<TaxonomyRpcResult>
  merge: (sourceId: string, targetId: string) => Promise<MergeTaxonomyResult>
  reorder: (id: string, direction: "up" | "down") => Promise<TaxonomyRpcResult>
}

export function useTaxonomyAdmin(): UseTaxonomyAdminReturn {
  const [items, setItems] = useState<TaxonomyAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await getTaxonomyAdminAction())
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la taxonomía.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  /** Recarga solo si la operación tuvo éxito, para no perder el error en pantalla. */
  const run = useCallback(
    async (operation: Promise<TaxonomyRpcResult>): Promise<TaxonomyRpcResult> => {
      const result = await operation
      if (result.success) fetchAll()
      else setError(result.error ?? "La operación falló.")
      return result
    },
    [fetchAll],
  )

  return {
    items,
    loading,
    error,
    refresh: fetchAll,
    create: (type, name) =>
      run(createTaxonomyAction(type === "category" ? "category" : "tag", name)),
    rename: (id, name) => run(renameTaxonomyAction(id, name)),
    toggle: (id, isActive) => run(toggleTaxonomyAction(id, isActive)),
    archive: (id) => run(archiveTaxonomyAction(id)),
    restore: (id) => run(restoreTaxonomyAction(id)),
    reorder: (id, direction) => run(reorderTaxonomyAction(id, direction)),
    merge: async (sourceId, targetId) => {
      const result = await mergeTaxonomyAction(sourceId, targetId)
      if (result.success) fetchAll()
      else setError(result.error ?? "La fusión falló.")
      return result
    },
  }
}
