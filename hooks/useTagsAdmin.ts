// hooks/useTagsAdmin.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  TagAdmin,
  TagRpcResult,
  MergeTagsResult,
} from "@/types/tag"

interface UseTagsAdminReturn {
  tags: TagAdmin[]
  loading: boolean
  error: string | null
  refresh: () => void
  createTag: (name: string) => Promise<TagRpcResult>
  renameTag: (tagId: string, newName: string) => Promise<TagRpcResult>
  toggleTag: (tagId: string, isActive: boolean) => Promise<TagRpcResult>
  archiveTag: (tagId: string) => Promise<TagRpcResult>
  restoreTag: (tagId: string) => Promise<TagRpcResult>
  mergeTags: (sourceId: string, targetId: string) => Promise<MergeTagsResult>
}

export function useTagsAdmin(): UseTagsAdminReturn {
  const [tags, setTags] = useState<TagAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchTags = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: dbError } = await supabase
      .from("v_tags_admin")
      .select("*")

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    setTags((data ?? []) as TagAdmin[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const createTag = useCallback(
    async (name: string): Promise<TagRpcResult> => {
      const { data, error: err } = await supabase.rpc("admin_create_tag", {
        p_name: name,
      })
      if (err) return { success: false, error: err.message }
      const result = data as TagRpcResult
      if (result.success) fetchTags()
      return result
    },
    [supabase, fetchTags]
  )

  const renameTag = useCallback(
    async (tagId: string, newName: string): Promise<TagRpcResult> => {
      const { data, error: err } = await supabase.rpc("admin_rename_tag", {
        p_tag_id: tagId,
        p_new_name: newName,
      })
      if (err) return { success: false, error: err.message }
      const result = data as TagRpcResult
      if (result.success) fetchTags()
      return result
    },
    [supabase, fetchTags]
  )

  const toggleTag = useCallback(
    async (tagId: string, isActive: boolean): Promise<TagRpcResult> => {
      const { data, error: err } = await supabase.rpc("admin_toggle_tag", {
        p_tag_id: tagId,
        p_is_active: isActive,
      })
      if (err) return { success: false, error: err.message }
      const result = data as TagRpcResult
      if (result.success) fetchTags()
      return result
    },
    [supabase, fetchTags]
  )

  const archiveTag = useCallback(
    async (tagId: string): Promise<TagRpcResult> => {
      const { data, error: err } = await supabase.rpc("archive_tag", {
        p_tag_id: tagId,
      })
      if (err) return { success: false, error: err.message }
      const result = data as TagRpcResult
      if (result.success) fetchTags()
      return result
    },
    [supabase, fetchTags]
  )

  const restoreTag = useCallback(
    async (tagId: string): Promise<TagRpcResult> => {
      const { data, error: err } = await supabase.rpc("restore_tag", {
        p_tag_id: tagId,
      })
      if (err) return { success: false, error: err.message }
      const result = data as TagRpcResult
      if (result.success) fetchTags()
      return result
    },
    [supabase, fetchTags]
  )

  const mergeTags = useCallback(
    async (sourceId: string, targetId: string): Promise<MergeTagsResult> => {
      const { data, error: err } = await supabase.rpc("merge_tags", {
        p_source_id: sourceId,
        p_target_id: targetId,
      })
      if (err) return { success: false, error: err.message }
      const result = data as MergeTagsResult
      if (result.success) fetchTags()
      return result
    },
    [supabase, fetchTags]
  )

  return {
    tags,
    loading,
    error,
    refresh: fetchTags,
    createTag,
    renameTag,
    toggleTag,
    archiveTag,
    restoreTag,
    mergeTags,
  }
}
