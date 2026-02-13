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

export interface ModerationLogEntry {
  id: string
  user_id: string
  type: "work_approved" | "work_rejected"
  target_id: string
  payload: {
    action: string
    moderated_by: string
    note: string
    moderated_at: string
  }
  created_at: string
}
