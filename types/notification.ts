// types/notification.ts

export interface NotificationPayload {
  liker_name?: string
  commenter_name?: string
  work_title?: string
  note?: string | null
  commentId?: string
  actor?: string
  title?: string
}

export interface Notification {
  id: string
  user_id: string
  type: "like" | "comment" | "work_approved" | "work_rejected"
  target_id: string | null
  payload: NotificationPayload
  read_at: string | null
  created_at: string
}
