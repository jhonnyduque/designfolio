// hooks/useTaxonomy.ts
"use client"

import { useCallback, useState } from "react"
import type {
  Taxonomy,
  TaxonomyType,
  AssignTagsResult,
  AssignCategoryResult,
} from "@/types/taxonomy"
import { TAXONOMY_LIMITS } from "@/types/taxonomy"
import { WORK_CATEGORIES } from "@/types/work"

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
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? "")
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags ?? [])
  const categories: Taxonomy[] = WORK_CATEGORIES.map((name) => ({
    id: `category-${name}`,
    name,
    slug: name.toLowerCase(),
    type: "category",
    active: true,
    usage_count: 0,
    sort_order: 0,
    created_at: new Date().toISOString(),
  }))
  const tags: Taxonomy[] = []
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

  const assignCategoryToWork = useCallback(async (_workId: string): Promise<AssignCategoryResult> => {
    return { success: true, category: selectedCategory }
  }, [selectedCategory])

  const assignTagsToWork = useCallback(async (_workId: string): Promise<AssignTagsResult> => {
    return { success: true, tags_assigned: selectedTags.length }
  }, [selectedTags])

  return {
    categories,
    tags,
    selectedCategory,
    selectedTags,
    loading: false,
    error: null,
    selectCategory,
    toggleTag,
    setSelectedTags,
    isMaxTagsReached,
    assignCategoryToWork,
    assignTagsToWork,
  }
}
