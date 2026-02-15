// hooks/useTags.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tag, AssignTagsResult } from "@/types/tag"
import { TAG_LIMITS } from "@/types/tag"

interface UseTagsReturn {
  /** All active tags sorted by usage_count DESC */
  allTags: Tag[]
  /** Currently selected tag names */
  selectedTags: string[]
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Toggle a tag on/off */
  toggleTag: (name: string) => void
  /** Set all selected tags at once (for editing existing work) */
  setSelectedTags: (tags: string[]) => void
  /** Whether max tags reached */
  isMaxReached: boolean
  /** Save tags to a work via RPC */
  assignToWork: (workId: string) => Promise<AssignTagsResult>
}

export function useTags(initialTags?: string[]): UseTagsReturn {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags ?? [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch all active tags on mount
  useEffect(() => {
    async function fetchTags() {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await supabase
        .from("v_tags_active")
        .select("*")

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
        return
      }

      setAllTags((data ?? []) as Tag[])
      setLoading(false)
    }

    fetchTags()
  }, [supabase])

  const isMaxReached = selectedTags.length >= TAG_LIMITS.MAX_PER_WORK

  const toggleTag = useCallback(
    (name: string) => {
      setSelectedTags((prev) => {
        const exists = prev.some(
          (t) => t.toLowerCase() === name.toLowerCase()
        )
        if (exists) {
          // Remove
          return prev.filter(
            (t) => t.toLowerCase() !== name.toLowerCase()
          )
        }
        // Add (if not at max)
        if (prev.length >= TAG_LIMITS.MAX_PER_WORK) return prev
        return [...prev, name]
      })
    },
    []
  )

  const assignToWork = useCallback(
    async (workId: string): Promise<AssignTagsResult> => {
      const { data, error: rpcError } = await supabase.rpc(
        "assign_tags_to_work",
        {
          p_work_id: workId,
          p_tag_names: selectedTags,
        }
      )

      if (rpcError) {
        return { success: false, error: rpcError.message }
      }

      return data as AssignTagsResult
    },
    [supabase, selectedTags]
  )

  return {
    allTags,
    selectedTags,
    loading,
    error,
    toggleTag,
    setSelectedTags,
    isMaxReached,
    assignToWork,
  }
}
