// hooks/useTaxonomy.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { getActiveTaxonomyAction } from "@/lib/server/actions/taxonomy"
import type { Taxonomy, AssignTagsResult, AssignCategoryResult } from "@/types/taxonomy"
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
  const [categories, setCategories] = useState<Taxonomy[]>([])
  const [tags, setTags] = useState<Taxonomy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? "")
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags ?? [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getActiveTaxonomyAction()
        if (cancelled) return
        const toTaxonomy = (kind: "category" | "tag") => (item: { id: string; name: string; slug: string; created_at: string }): Taxonomy => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          type: kind,
          active: true,
          usage_count: 0,
          sort_order: 0,
          created_at: item.created_at,
        })
        setCategories(data.categories.map(toTaxonomy("category")))
        setTags(data.tags.map(toTaxonomy("tag")))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar las categorías y etiquetas.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

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

  // La categoría y las etiquetas viajan en el cuerpo de POST /api/works, que es
  // quien las persiste. Estas funciones existen para la interfaz anterior.
  const assignCategoryToWork = useCallback(
    async (): Promise<AssignCategoryResult> => ({ success: true, category: selectedCategory }),
    [selectedCategory]
  )

  const assignTagsToWork = useCallback(
    async (): Promise<AssignTagsResult> => ({ success: true, tags_assigned: selectedTags.length }),
    [selectedTags]
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
