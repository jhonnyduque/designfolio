// types/taxonomy.ts

export type TaxonomyType = "category" | "tag"

export interface Taxonomy {
  id: string
  type: TaxonomyType
  name: string
  slug: string
  usage_count: number
  sort_order: number
  created_at: string
}

export interface TaxonomyAdmin extends Taxonomy {
  is_active: boolean
  is_archived: boolean
  created_by: string | null
  created_by_name: string | null
  updated_at: string
}

export interface TaxonomyRpcResult {
  success: boolean
  error?: string
  name?: string
  old_name?: string
  new_name?: string
  id?: string
  slug?: string
  is_active?: boolean
  usage_count?: number
  direction?: string
}

export interface MergeTaxonomyResult {
  success: boolean
  error?: string
  source_name?: string
  target_name?: string
  moved?: number
  duplicates_removed?: number
}

export interface AssignTagsResult {
  success: boolean
  error?: string
  tags_assigned?: number
  tags_skipped?: number
}

export interface AssignCategoryResult {
  success: boolean
  error?: string
  category?: string
}

export const TAXONOMY_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  MAX_TAGS_PER_WORK: 8,
  MAX_CATEGORIES_PER_WORK: 1,
} as const
