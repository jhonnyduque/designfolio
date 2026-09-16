import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm"
import { comments, likes, profiles, works } from "@/lib/db/schema"
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

const visible = and(eq(works.moderationStatus, "approved"), sql`${works.archivedAt} is null`)

/**
 * Detalle de un proyecto dentro del dashboard.
 *
 * El autor ve siempre el suyo, esté pendiente de revisión, rechazado o archivado
 * — "Mis proyectos" enlaza a todos. Cualquier otra persona con sesión solo ve los
 * aprobados y sin archivar.
 */
export async function getDashboardWork(id: string, viewerId: string) {
  const db = getDb()
  const [work] = await db.select().from(works).where(eq(works.id, id)).limit(1)
  if (!work) return null

  const isOwner = work.authorId === viewerId
  if (!isOwner && (work.moderationStatus !== "approved" || work.archivedAt !== null)) return null

  const publishedAt = work.publishedAt ?? work.createdAt
  const [authors, likeTotals, commentTotals, previous, next] = await Promise.all([
    db.select({
      id: profiles.id,
      username: profiles.username,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      reputationLevel: profiles.reputationLevel,
      bio: profiles.bio,
      school: profiles.school,
    }).from(profiles).where(eq(profiles.id, work.authorId)).limit(1),
    db.select({ count: sql<number>`count(*)` }).from(likes).where(eq(likes.workId, work.id)),
    db.select({ count: sql<number>`count(*)` }).from(comments).where(eq(comments.workId, work.id)),
    db.select({ id: works.id }).from(works)
      .where(and(visible, gt(works.publishedAt, publishedAt))).orderBy(asc(works.publishedAt)).limit(1),
    db.select({ id: works.id }).from(works)
      .where(and(visible, lt(works.publishedAt, publishedAt))).orderBy(desc(works.publishedAt)).limit(1),
  ])

  const author = authors[0]
  if (!author) return null

  return {
    work,
    author,
    isOwner,
    likesCount: Number(likeTotals[0]?.count ?? 0),
    commentsCount: Number(commentTotals[0]?.count ?? 0),
    previous: previous[0] ?? null,
    next: next[0] ?? null,
  }
}

/**
 * Perfil público de un usuario dentro del dashboard, con sus proyectos aprobados.
 *
 * `total_points` no existe en MySQL: era una columna de Supabase y ningún proceso
 * la alimentaba aquí, así que el badge de puntos se omite hasta que exista un
 * sistema de reputación real.
 */
export async function getProfileByUsername(username: string) {
  const db = getDb()
  const [profile] = await db.select({
    id: profiles.id,
    username: profiles.username,
    fullName: profiles.fullName,
    avatarUrl: profiles.avatarUrl,
    bio: profiles.bio,
    school: profiles.school,
    careerYear: profiles.careerYear,
    categories: profiles.categories,
    reputationLevel: profiles.reputationLevel,
    createdAt: profiles.createdAt,
  }).from(profiles).where(eq(profiles.username, username)).limit(1)
  if (!profile) return null

  const likeCounts = db.select({ workId: likes.workId, count: sql<number>`count(*)`.as("likes_count") })
    .from(likes).groupBy(likes.workId).as("profile_like_counts")
  const commentCounts = db.select({ workId: comments.workId, count: sql<number>`count(*)`.as("comments_count") })
    .from(comments).groupBy(comments.workId).as("profile_comment_counts")

  const rows = await db.select({
    id: works.id,
    title: works.title,
    category: works.category,
    images: works.images,
    likesCount: sql<number>`coalesce(${likeCounts.count}, 0)`,
    commentsCount: sql<number>`coalesce(${commentCounts.count}, 0)`,
    publishedAt: works.publishedAt,
    createdAt: works.createdAt,
  }).from(works)
    .leftJoin(likeCounts, eq(works.id, likeCounts.workId))
    .leftJoin(commentCounts, eq(works.id, commentCounts.workId))
    .where(and(eq(works.authorId, profile.id), visible))
    .orderBy(desc(works.publishedAt))

  return {
    profile,
    works: rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      images: row.images ?? [],
      likes_count: Number(row.likesCount),
      comments_count: Number(row.commentsCount),
      published_at: (row.publishedAt ?? row.createdAt).toISOString(),
    })),
  }
}
