// types/notification.ts

export interface Notification {
  id: string
  user_id: string
  type: "like" | "comment" | "work_approved" | "work_rejected"
  target_id: string | null
  payload: Record<string, any>
  read_at: string | null
  created_at: string
}
