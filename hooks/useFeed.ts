"use client"

import { useCallback, useEffect, useState } from "react"
import type { FeedItem, SortOption } from "@/types/feed"

interface FeedResponse {
  items: FeedItem[]
  hasMore: boolean
  error?: string
}

export function useFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchFeed = useCallback(async (pageNum: number, append: boolean, signal?: AbortSignal) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(pageNum), sort: sortBy, q: search })
      const response = await fetch(`/api/feed?${params}`, { signal })
      const data = await response.json() as FeedResponse
      if (!response.ok) throw new Error(data.error ?? "Error al cargar el feed")
      if (signal?.aborted) return
      setItems((previous) => append ? [...previous, ...data.items] : data.items)
      setHasMore(data.hasMore)
      setPage(pageNum)
    } catch (cause) {
      if (signal?.aborted) return
      setError(cause instanceof Error ? cause.message : "Error al cargar el feed")
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [sortBy, search])

  useEffect(() => {
    const controller = new AbortController()
    fetchFeed(0, false, controller.signal)
    return () => controller.abort()
  }, [fetchFeed, refreshKey])

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) void fetchFeed(page + 1, true)
  }, [loading, loadingMore, hasMore, page, fetchFeed])

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), [])

  return { items, loading, loadingMore, error, hasMore, sortBy, setSortBy, search, setSearch, loadMore, refresh }
}
