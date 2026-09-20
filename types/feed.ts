// types/feed.ts

import type { WorkImage } from "@/types/work"

/** Contrato de presentación consumido por el feed público. */
export interface FeedItem {
  id: string
  slug?: string | null
  author_id: string
  title: string
  description: string
  category: string
  images: WorkImage[] | null
  likes_count: number
  comments_count: number
  views_count: number
  shares_count: number
  created_at: string
  published_at: string
  author_username: string
  author_full_name: string
  author_avatar_url: string | null
  author_reputation_level: number
}

export type SortOption = "recent" | "most_voted" | "most_commented"

export interface SortConfig {
  column: string
  ascending: boolean
  label: string
}

export const SORT_OPTIONS: Record<SortOption, SortConfig> = {
  recent:         { column: "published_at",   ascending: false, label: "Más nuevos" },
  most_voted:     { column: "likes_count",    ascending: false, label: "Más votados" },
  most_commented: { column: "comments_count", ascending: false, label: "Más comentados" },
}

export const FEED_PAGE_SIZE = 10
