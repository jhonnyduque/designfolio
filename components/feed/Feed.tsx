// components/feed/Feed.tsx
"use client"

import { useEffect, useRef } from "react"
import { useFeed } from "@/hooks/useFeed"
import { SortSelector } from "./SortSelector"
import { FeedCard } from "./FeedCard"

function Skeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-14 bg-gray-100 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="flex items-center gap-2 pt-1">
          <div className="w-6 h-6 bg-gray-100 rounded-full" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-3 pt-1">
          <div className="h-2.5 w-8 bg-gray-100 rounded" />
          <div className="h-2.5 w-8 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}

export function Feed() {
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    sortBy,
    setSortBy,
    loadMore,
    refresh,
  } = useFeed()

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // 🔥 Infinite Scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      {
        rootMargin: "200px", // pre-load antes de llegar al final
      }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadMore])

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Descubre obras de la comunidad
          </p>
        </div>
        <SortSelector current={sortBy} onChange={setSortBy} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Skeleton inicial */}
      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <div
          id="feed-grid"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
          {items.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-gray-500 font-medium">
            Aún no hay obras publicadas
          </p>
        </div>
      )}

      {/* Loading más contenido */}
      {loadingMore && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`more-${i}`} />
          ))}
        </div>
      )}

      {/* Sentinel invisible */}
      {hasMore && <div ref={sentinelRef} className="h-10" />}

      {/* End */}
      {!hasMore && items.length > 0 && (
        <p className="mt-10 text-center text-sm text-gray-400">
          Has llegado al final del feed.
        </p>
      )}
    </section>
  )
}
