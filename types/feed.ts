// types/feed.ts

/** Matches v_feed_scores materialized view columns exactly */
export interface FeedItem {
  id: string
  author_id: string
  title: string
  category: string
  tags: string[] | null
  images: WorkImage[] | null
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  published_at: string
  author_username: string
  author_full_name: string
  author_avatar_url: string | null
  author_reputation_level: number
  trending_score: number
}

export interface WorkImage {
  url: string
  width: number
  height: number
  type: string
  order: number
}

export type SortOption = "popular" | "most_voted" | "most_commented" | "recent"

export interface SortConfig {
  column: string
  ascending: boolean
  label: string
}

export const SORT_OPTIONS: Record<SortOption, SortConfig> = {
  popular:        { column: "trending_score", ascending: false, label: "Popular" },
  most_voted:     { column: "likes_count",    ascending: false, label: "Más votados" },
  most_commented: { column: "comments_count", ascending: false, label: "Más comentados" },
  recent:         { column: "published_at",   ascending: false, label: "Más nuevos" },
}

export const FEED_PAGE_SIZE = 10
