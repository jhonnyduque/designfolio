// types/comment.ts

export interface Comment {
  id: string
  user_id: string
  work_id: string
  content: string
  categories: string[]
  is_valid: boolean
  created_at: string
  // Joined
  author_username: string
  author_full_name: string
  author_avatar_url: string | null
}

/** Feedback categories for structured comments */
export const COMMENT_CATEGORIES = [
  "Concepto",
  "Ejecución",
  "Tipografía",
  "Color",
  "Composición",
  "Originalidad",
] as const

export const COMMENT_MIN_LENGTH = 100
