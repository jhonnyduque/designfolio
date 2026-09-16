import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { comments, likes, profiles, works } from "@/lib/db/schema"

const approved = and(eq(works.moderationStatus, "approved"), sql`${works.archivedAt} is null`)

export async function getPublicWork(slugOrId: string) {
  const isId = /^[0-9a-f-]{36}$/i.test(slugOrId)
  const [work] = await getDb().select().from(works)
    .where(and(approved, isId ? eq(works.id, slugOrId) : eq(works.slug, slugOrId))).limit(1)
  if (!work) return null

  const [authors, likeTotals, commentTotals, previous, next] = await Promise.all([
    getDb().select({ id: profiles.id, username: profiles.username, fullName: profiles.fullName, avatarUrl: profiles.avatarUrl, reputationLevel: profiles.reputationLevel, bio: profiles.bio, school: profiles.school })
      .from(profiles).where(eq(profiles.id, work.authorId)).limit(1),
    getDb().select({ count: sql<number>`count(*)` }).from(likes).where(eq(likes.workId, work.id)),
    getDb().select({ count: sql<number>`count(*)` }).from(comments).where(eq(comments.workId, work.id)),
    getDb().select({ id: works.id, slug: works.slug }).from(works)
      .where(and(approved, gt(works.publishedAt, work.publishedAt ?? work.createdAt))).orderBy(asc(works.publishedAt)).limit(1),
    getDb().select({ id: works.id, slug: works.slug }).from(works)
      .where(and(approved, lt(works.publishedAt, work.publishedAt ?? work.createdAt))).orderBy(desc(works.publishedAt)).limit(1),
  ])
  const author = authors[0]
  if (!author) return null
  return { work, author, likesCount: Number(likeTotals[0]?.count ?? 0), commentsCount: Number(commentTotals[0]?.count ?? 0), previous: previous[0] ?? null, next: next[0] ?? null }
}
