import { desc, eq, sql } from "drizzle-orm"
import { comments, likes, works } from "@/lib/db/schema"
import { getDb } from "@/lib/db/client"

export type DashboardWork = {
  id: string
  title: string
  category: string
  images: { url: string; type?: string }[]
  moderation_status: string
  archived: boolean
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  published_at: string | null
}

export async function getDashboardWorks(userId: string): Promise<DashboardWork[]> {
  const rows = await getDb().select({
    id: works.id,
    title: works.title,
    category: works.category,
    images: works.images,
    moderationStatus: works.moderationStatus,
    archivedAt: works.archivedAt,
    viewsCount: works.viewsCount,
    createdAt: works.createdAt,
    publishedAt: works.publishedAt,
    likesCount: sql<number>`(select count(*) from ${likes} where ${likes.workId} = ${works.id})`,
    commentsCount: sql<number>`(select count(*) from ${comments} where ${comments.workId} = ${works.id})`,
  }).from(works).where(eq(works.authorId, userId)).orderBy(desc(works.createdAt))

  return rows.map((work) => ({
    id: work.id,
    title: work.title,
    category: work.category,
    images: work.images ?? [],
    moderation_status: work.moderationStatus,
    archived: Boolean(work.archivedAt),
    likes_count: Number(work.likesCount ?? 0),
    comments_count: Number(work.commentsCount ?? 0),
    views_count: work.viewsCount,
    created_at: work.createdAt.toISOString(),
    published_at: work.publishedAt?.toISOString() ?? null,
  }))
}
