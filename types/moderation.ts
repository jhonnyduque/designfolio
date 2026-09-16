// types/moderation.ts

export type ModerationStatus = "draft" | "pending_review" | "approved" | "rejected"

export interface ModerationWork {
  id: string
  author_id: string
  title: string
  description: string
  category: string
  tags: string[] | null
  images: { url: string; width: number; height: number; type: string; order: number }[]
  moderation_status: ModerationStatus
  created_at: string
  published_at: string | null
  // Joined from profiles
  author_username: string
  author_full_name: string
  author_avatar_url: string | null
  author_reputation_level: number
}

export interface ModerationAction {
  action: "approve" | "reject"
  note?: string
}

export interface ModerationResult {
  success: boolean
  work_id?: string
  new_status?: string
  note?: string
  error?: string
}

export type ModerationLogAction = "approve" | "reject" | "archive" | "restore" | "delete"

/** Una fila de `moderation_log`: el registro de auditoría real, no la notificación al autor. */
export interface ModerationLogEntry {
  id: string
  /** Queda en null si el proyecto se eliminó; `work_title` conserva cuál era. */
  work_id: string | null
  work_title: string
  actor_name: string
  action: ModerationLogAction
  note: string | null
  created_at: string
}
