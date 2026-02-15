// hooks/useTaxonomy.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  Taxonomy,
  TaxonomyType,
  AssignTagsResult,
  AssignCategoryResult,
} from "@/types/taxonomy"
import { TAXONOMY_LIMITS } from "@/types/taxonomy"

interface UseTaxonomyReturn {
  categories: Taxonomy[]
  tags: Taxonomy[]
  selectedCategory: string
  selectedTags: string[]
  loading: boolean
  error: string | null
  selectCategory: (name: string) => void
  toggleTag: (name: string) => void
  setSelectedTags: (tags: string[]) => void
  isMaxTagsReached: boolean
  assignCategoryToWork: (workId: string) => Promise<AssignCategoryResult>
  assignTagsToWork: (workId: string) => Promise<AssignTagsResult>
}

export function useTaxonomy(
  initialCategory?: string,
  initialTags?: string[]
): UseTaxonomyReturn {
  const [allItems, setAllItems] = useState<Taxonomy[]>([])
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? "")
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags ?? [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from("v_taxonomy_active")
        .select("*")
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      setAllItems((data ?? []) as Taxonomy[])
      setLoading(false)
    }
    fetch()
  }, [supabase])

  const categories = allItems.filter((i) => i.type === "category")
  const tags = allItems.filter((i) => i.type === "tag")
  const isMaxTagsReached = selectedTags.length >= TAXONOMY_LIMITS.MAX_TAGS_PER_WORK

  const selectCategory = useCallback((name: string) => {
    setSelectedCategory((prev) => (prev === name ? "" : name))
  }, [])

  const toggleTag = useCallback((name: string) => {
    setSelectedTags((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === name.toLowerCase())
      if (exists) return prev.filter((t) => t.toLowerCase() !== name.toLowerCase())
      if (prev.length >= TAXONOMY_LIMITS.MAX_TAGS_PER_WORK) return prev
      return [...prev, name]
    })
  }, [])

  const assignCategoryToWork = useCallback(
    async (workId: string): Promise<AssignCategoryResult> => {
      if (!selectedCategory) return { success: true, category: "" }
      const { data, error: err } = await supabase.rpc("assign_category_to_work", {
        p_work_id: workId,
        p_category_name: selectedCategory,
      })
      if (err) return { success: false, error: err.message }
      return data as AssignCategoryResult
    },
    [supabase, selectedCategory]
  )

  const assignTagsToWork = useCallback(
    async (workId: string): Promise<AssignTagsResult> => {
      if (selectedTags.length === 0) return { success: true, tags_assigned: 0 }
      const { data, error: err } = await supabase.rpc("assign_tags_to_work", {
        p_work_id: workId,
        p_tag_names: selectedTags,
      })
      if (err) return { success: false, error: err.message }
      return data as AssignTagsResult
    },
    [supabase, selectedTags]
  )

  return {
    categories,
    tags,
    selectedCategory,
    selectedTags,
    loading,
    error,
    selectCategory,
    toggleTag,
    setSelectedTags,
    isMaxTagsReached,
    assignCategoryToWork,
    assignTagsToWork,
  }
}
