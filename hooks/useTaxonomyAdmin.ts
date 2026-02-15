// hooks/useTaxonomyAdmin.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase.from("v_taxonomy_admin").select("*")
    if (err) { setError(err.message); setLoading(false); return }
    setItems((data ?? []) as TaxonomyAdmin[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchAll() }, [fetchAll])

  const rpc = useCallback(
    async (fn: string, params: Record<string, unknown>): Promise<TaxonomyRpcResult> => {
      const { data, error: err } = await supabase.rpc(fn, params)
      if (err) return { success: false, error: err.message }
      const r = data as TaxonomyRpcResult
      if (r.success) fetchAll()
      return r
    },
    [supabase, fetchAll]
  )

  return {
    items,
    loading,
    error,
    refresh: fetchAll,
    create: (type, name) => rpc("admin_create_taxonomy", { p_type: type, p_name: name }),
    rename: (id, name) => rpc("admin_rename_taxonomy", { p_id: id, p_new_name: name }),
    toggle: (id, active) => rpc("admin_toggle_taxonomy", { p_id: id, p_is_active: active }),
    archive: (id) => rpc("admin_archive_taxonomy", { p_id: id }),
    restore: (id) => rpc("admin_restore_taxonomy", { p_id: id }),
    merge: async (s, t) => {
      const { data, error: err } = await supabase.rpc("admin_merge_taxonomy", { p_source_id: s, p_target_id: t })
      if (err) return { success: false, error: err.message }
      const r = data as MergeTaxonomyResult
      if (r.success) fetchAll()
      return r
    },
    reorder: (id, dir) => rpc("admin_reorder_taxonomy", { p_id: id, p_direction: dir }),
  }
}
