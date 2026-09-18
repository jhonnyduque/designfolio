// hooks/useTags.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { getActiveTagsAction } from "@/lib/server/actions/taxonomy"
import type { Tag, AssignTagsResult } from "@/types/tag"
import { TAG_LIMITS } from "@/types/tag"

interface UseTagsReturn {
  /** All active tags */
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
}

export function useTags(initialTags?: string[]): UseTagsReturn {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags ?? [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all active tags on mount
  useEffect(() => {
    async function fetchTags() {
      setLoading(true)
      setError(null)
      try {
        const data = await getActiveTagsAction()
        setAllTags(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

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

  return {
    allTags,
    selectedTags,
    loading,
    error,
    toggleTag,
    setSelectedTags,
    isMaxReached,
  }
}
