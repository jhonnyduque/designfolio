// types/comment.ts

export interface Comment {
  id: string
  user_id: string | null
  work_id: string
  content: string
  /** Campo legado: se conserva para leer comentarios antiguos sin migrar la base. */
  categories?: string[]
  is_valid: boolean
  created_at: string
  author_username: string
  author_full_name: string
  author_avatar_url: string | null
  source?: "registered" | "public"
}
