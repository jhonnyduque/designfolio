// hooks/useFeed.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { FeedItem, SortOption } from "@/types/feed"
import { SORT_OPTIONS, FEED_PAGE_SIZE } from "@/types/feed"

interface UseFeedReturn {
  items: FeedItem[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  search: string
  setSearch: (q: string) => void
  loadMore: () => void
  refresh: () => void
}

export function useFeed(): UseFeedReturn {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortByState] = useState<SortOption>("recent")
  const [search, setSearchState] = useState("")
  const [page, setPage] = useState(0)

  const supabase = createClient()

  const fetchFeed = useCallback(
    async (pageNum: number, sort: SortOption, q: string, append: boolean) => {
      if (append) setLoadingMore(true)
      else setLoading(true)
      setError(null)

      const config = SORT_OPTIONS[sort]
      const from = pageNum * FEED_PAGE_SIZE
      const to = from + FEED_PAGE_SIZE - 1

      try {
        let query = supabase
          .from("v_feed_scores")
          .select("*")
          .order(config.column, { ascending: config.ascending })
          .order("created_at", { ascending: false })

        // Server-side search: filter by title, category, tags, or author
        if (q.trim()) {
          const term = `%${q.trim()}%`
          query = query.or(
            `title.ilike.${term},category.ilike.${term},author_full_name.ilike.${term}`
          )
        }

        query = query.range(from, to)

        const { data, error: dbError } = await query

        if (dbError) throw dbError

        const results = (data ?? []) as FeedItem[]
        setItems((prev) => (append ? [...prev, ...results] : results))
        setHasMore(results.length === FEED_PAGE_SIZE)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el feed"
        )
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [supabase]
  )

  useEffect(() => {
    setPage(0)
    fetchFeed(0, sortBy, search, false)
  }, [sortBy, search, fetchFeed])

  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort)
  }, [])

  const setSearch = useCallback((q: string) => {
    setSearchState(q)
  }, [])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    const next = page + 1
    setPage(next)
    fetchFeed(next, sortBy, search, true)
  }, [loading, loadingMore, hasMore, page, sortBy, search, fetchFeed])

  const refresh = useCallback(() => {
    setPage(0)
    fetchFeed(0, sortBy, search, false)
  }, [sortBy, search, fetchFeed])

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    sortBy,
    setSortBy,
    search,
    setSearch,
    loadMore,
    refresh,
  }
}
