// hooks/useTagsAdmin.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getAdminTagsAction,
  createTagAction,
  renameTagAction,
  toggleTagAction,
  archiveTagAction,
  restoreTagAction,
  mergeTagsAction,
} from "@/lib/server/actions/taxonomy"
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

  const fetchTags = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminTagsAction()
      setTags(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const createTag = useCallback(
    async (name: string): Promise<TagRpcResult> => {
      const result = await createTagAction(name)
      if (result.success) fetchTags()
      return result
    },
    [fetchTags]
  )

  const renameTag = useCallback(
    async (tagId: string, newName: string): Promise<TagRpcResult> => {
      const result = await renameTagAction(tagId, newName)
      if (result.success) fetchTags()
      return result
    },
    [fetchTags]
  )

  const toggleTag = useCallback(
    async (tagId: string, isActive: boolean): Promise<TagRpcResult> => {
      const result = await toggleTagAction(tagId, isActive)
      if (result.success) fetchTags()
      return result
    },
    [fetchTags]
  )

  const archiveTag = useCallback(
    async (tagId: string): Promise<TagRpcResult> => {
      const result = await archiveTagAction(tagId)
      if (result.success) fetchTags()
      return result
    },
    [fetchTags]
  )

  const restoreTag = useCallback(
    async (tagId: string): Promise<TagRpcResult> => {
      const result = await restoreTagAction(tagId)
      if (result.success) fetchTags()
      return result
    },
    [fetchTags]
  )

  const mergeTags = useCallback(
    async (sourceId: string, targetId: string): Promise<MergeTagsResult> => {
      const result = await mergeTagsAction(sourceId, targetId)
      if (result.success) fetchTags()
      return result
    },
    [fetchTags]
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
