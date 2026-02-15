// types/tag.ts

/** Tag activa — matches v_tags_active view */
export interface Tag {
  id: string
  name: string
  slug: string
  usage_count: number
  created_at: string
}

/** Tag para admin — matches v_tags_admin view */
export interface TagAdmin {
  id: string
  name: string
  slug: string
  is_active: boolean
  is_archived: boolean
  usage_count: number
  created_by: string | null
  created_by_name: string | null
  created_at: string
  updated_at: string
}

/** Relación work-tag — matches work_tags table */
export interface WorkTag {
  work_id: string
  tag_id: string
  created_at: string
}

/** Respuesta genérica de RPCs de tags */
export interface TagRpcResult {
  success: boolean
  error?: string
  [key: string]: unknown
}

/** Respuesta de merge_tags */
export interface MergeTagsResult extends TagRpcResult {
  source_name?: string
  target_name?: string
  moved?: number
  duplicates_removed?: number
  works_synced?: number
}

/** Respuesta de assign_tags_to_work */
export interface AssignTagsResult extends TagRpcResult {
  tags_assigned?: number
}

/** Respuesta de migrate_legacy_tags */
export interface MigrateLegacyResult extends TagRpcResult {
  tags_created?: number
  relations_created?: number
  works_processed?: number
}

/** Límites alineados con CHECK constraints en tags */
export const TAG_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  MAX_PER_WORK: 8,
} as const
