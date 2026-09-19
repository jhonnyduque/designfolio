import { and, desc, eq, like, or, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/client"
import { comments, likes, profiles, works } from "@/lib/db/schema"
import { FEED_PAGE_SIZE } from "@/types/feed"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const page = Number(params.get("page") ?? 0)
  const sort = params.get("sort") ?? "recent"
  const search = params.get("q")?.trim().slice(0, 100) ?? ""

  if (!Number.isSafeInteger(page) || page < 0 || page > 10000 ||
      !["recent", "most_voted", "most_commented"].includes(sort)) {
    return NextResponse.json({ error: "Parámetros de búsqueda inválidos." }, { status: 400 })
  }

  try {
    const db = getDb()
    const likeCounts = db.select({ workId: likes.workId, count: sql<number>`count(*)`.as("likes_count") })
      .from(likes).groupBy(likes.workId).as("like_counts")
    const commentCounts = db.select({ workId: comments.workId, count: sql<number>`count(*)`.as("comments_count") })
      .from(comments).groupBy(comments.workId).as("comment_counts")
    const likesCount = sql<number>`coalesce(${likeCounts.count}, 0)`
    const commentsCount = sql<number>`coalesce(${commentCounts.count}, 0)`
    const where = and(
      eq(works.moderationStatus, "approved"),
      sql`${works.archivedAt} is null`,
      search ? or(
        like(works.title, `%${search}%`),
        like(works.category, `%${search}%`),
        like(profiles.fullName, `%${search}%`),
      ) : undefined,
    )
    const order = sort === "most_voted" ? desc(likesCount)
      : sort === "most_commented" ? desc(commentsCount)
        : desc(works.publishedAt)

    const rows = await db.select({
      id: works.id,
      slug: works.slug,
      authorId: works.authorId,
      title: works.title,
      description: works.description,
      category: works.category,
      tags: works.tags,
      images: works.images,
      likesCount,
      commentsCount,
      viewsCount: works.viewsCount,
      createdAt: works.createdAt,
      publishedAt: works.publishedAt,
      authorUsername: profiles.username,
      authorFullName: profiles.fullName,
      authorAvatarUrl: profiles.avatarUrl,
      authorReputationLevel: profiles.reputationLevel,
    }).from(works)
      .innerJoin(profiles, eq(works.authorId, profiles.id))
      .leftJoin(likeCounts, eq(works.id, likeCounts.workId))
      .leftJoin(commentCounts, eq(works.id, commentCounts.workId))
      .where(where)
      .orderBy(order, desc(works.createdAt), desc(works.id))
      .limit(FEED_PAGE_SIZE + 1)
      .offset(page * FEED_PAGE_SIZE)

    const items = rows.slice(0, FEED_PAGE_SIZE).map((row) => ({
      id: row.id,
      slug: row.slug,
      author_id: row.authorId,
      title: row.title,
      description: row.description,
      category: row.category,
      tags: row.tags ?? [],
      images: row.images,
      likes_count: Number(row.likesCount),
      comments_count: Number(row.commentsCount),
      views_count: row.viewsCount,
      created_at: row.createdAt.toISOString(),
      published_at: (row.publishedAt ?? row.createdAt).toISOString(),
      author_username: row.authorUsername,
      author_full_name: row.authorFullName,
      author_avatar_url: row.authorAvatarUrl,
      author_reputation_level: row.authorReputationLevel,
      trending_score: 0,
    }))

    return NextResponse.json({ items, hasMore: rows.length > FEED_PAGE_SIZE })
  } catch (error) {
    console.error("Feed query failed", error)
    return NextResponse.json({ error: "No se pudo cargar el feed. Revisa la conexión con la base de datos." }, { status: 503 })
  }
}
