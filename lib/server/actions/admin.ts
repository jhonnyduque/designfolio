"use server"

import crypto from "crypto"
import { and, desc, eq, sql } from "drizzle-orm"
import { headers } from "next/headers"
import type { RowDataPacket } from "mysql2"
import { auth } from "@/lib/auth"
import { getDb, getPool } from "@/lib/db/client"
import { comments, likes, moderationLog, profiles, works } from "@/lib/db/schema"

export type AdminWorkRow = {
  id: string
  title: string
  category: string
  images: { url: string }[] | null
  moderation_status: string
  archived: boolean
  likes_count: number
  comments_count: number
  created_at: string
  author_name: string
  author_username: string
}

export type AdminUserRow = {
  id: string
  full_name: string
  username: string
  email_from_auth?: string
  avatar_url: string | null
  school: string | null
  is_active: boolean
  is_founder: boolean
  reputation_level: number
  created_at: string
  approved_count: number
  pending_count: number
  rejected_count: number
}

export type AdminResult = { success: boolean; error?: string }

/** Toda acción de este módulo exige sesión válida y perfil de fundador activo. */
async function requireFounder() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("No autenticado")

  const [profile] = await getDb()
    .select({ id: profiles.id, isFounder: profiles.isFounder, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!profile?.isFounder || !profile.isActive) throw new Error("No autorizado")
  return profile
}

function fail(error: unknown): AdminResult {
  return { success: false, error: error instanceof Error ? error.message : "Error inesperado" }
}

// ---------------------------------------------------------------- proyectos

export async function getAdminWorksAction(
  filter: "all" | "approved" | "archived" = "approved",
): Promise<AdminWorkRow[]> {
  await requireFounder()
  const db = getDb()

  const likeCounts = db
    .select({ workId: likes.workId, count: sql<number>`count(*)`.as("likes_count") })
    .from(likes).groupBy(likes.workId).as("admin_like_counts")
  const commentCounts = db
    .select({ workId: comments.workId, count: sql<number>`count(*)`.as("comments_count") })
    .from(comments).groupBy(comments.workId).as("admin_comment_counts")

  const where =
    filter === "approved" ? and(eq(works.moderationStatus, "approved"), sql`${works.archivedAt} is null`)
      : filter === "archived" ? sql`${works.archivedAt} is not null`
        : undefined

  const rows = await db
    .select({
      id: works.id,
      title: works.title,
      category: works.category,
      images: works.images,
      moderationStatus: works.moderationStatus,
      archivedAt: works.archivedAt,
      likesCount: sql<number>`coalesce(${likeCounts.count}, 0)`,
      commentsCount: sql<number>`coalesce(${commentCounts.count}, 0)`,
      createdAt: works.createdAt,
      authorName: profiles.fullName,
      authorUsername: profiles.username,
    })
    .from(works)
    .innerJoin(profiles, eq(works.authorId, profiles.id))
    .leftJoin(likeCounts, eq(works.id, likeCounts.workId))
    .leftJoin(commentCounts, eq(works.id, commentCounts.workId))
    .where(where)
    .orderBy(desc(works.createdAt))

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    images: row.images ?? null,
    moderation_status: row.moderationStatus,
    archived: row.archivedAt !== null,
    likes_count: Number(row.likesCount),
    comments_count: Number(row.commentsCount),
    created_at: row.createdAt.toISOString(),
    author_name: row.authorName,
    author_username: row.authorUsername,
  }))
}

export async function setWorkArchivedAction(workId: string, archived: boolean): Promise<AdminResult> {
  try {
    const admin = await requireFounder()
    const db = getDb()

    const [work] = await db.select({ title: works.title }).from(works).where(eq(works.id, workId)).limit(1)
    if (!work) throw new Error("Proyecto no encontrado")

    await db.update(works)
      .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
      .where(eq(works.id, workId))

    await db.insert(moderationLog).values({
      id: crypto.randomUUID(),
      workId,
      workTitle: work.title,
      actorId: admin.id,
      action: archived ? "archive" : "restore",
    })

    return { success: true }
  } catch (error) {
    return fail(error)
  }
}

export async function adminDeleteWorkAction(workId: string): Promise<AdminResult> {
  try {
    const admin = await requireFounder()
    const db = getDb()

    const [work] = await db.select({ title: works.title }).from(works).where(eq(works.id, workId)).limit(1)
    if (!work) throw new Error("Proyecto no encontrado")

    // El registro se escribe antes de borrar. work_id queda en null por la clave
    // foránea, pero work_title conserva de qué proyecto se trataba.
    await db.insert(moderationLog).values({
      id: crypto.randomUUID(),
      workId,
      workTitle: work.title,
      actorId: admin.id,
      action: "delete",
    })

    await db.delete(works).where(eq(works.id, workId))
    return { success: true }
  } catch (error) {
    return fail(error)
  }
}

// ---------------------------------------------------------------- usuarios

export async function getAdminUsersAction(): Promise<AdminUserRow[]> {
  await requireFounder()
  const db = getDb()

  const [rows, counts, emailRows] = await Promise.all([
    db.select({
      id: profiles.id,
      fullName: profiles.fullName,
      username: profiles.username,
      avatarUrl: profiles.avatarUrl,
      school: profiles.school,
      isActive: profiles.isActive,
      isFounder: profiles.isFounder,
      reputationLevel: profiles.reputationLevel,
      createdAt: profiles.createdAt,
    }).from(profiles).orderBy(desc(profiles.createdAt)),
    db.select({
      authorId: works.authorId,
      status: works.moderationStatus,
      count: sql<number>`count(*)`,
    }).from(works).groupBy(works.authorId, works.moderationStatus),
    // El correo lo administra Better Auth en su propia tabla `user`.
    getPool().query<RowDataPacket[]>("SELECT id, email FROM `user`"),
  ])

  const emails = new Map<string, string>()
  for (const row of emailRows[0]) emails.set(row.id as string, row.email as string)

  const tally = new Map<string, { approved: number; pending: number; rejected: number }>()
  for (const row of counts) {
    const entry = tally.get(row.authorId) ?? { approved: 0, pending: 0, rejected: 0 }
    if (row.status === "approved") entry.approved = Number(row.count)
    if (row.status === "pending_review") entry.pending = Number(row.count)
    if (row.status === "rejected") entry.rejected = Number(row.count)
    tally.set(row.authorId, entry)
  }

  return rows.map((row) => {
    const entry = tally.get(row.id) ?? { approved: 0, pending: 0, rejected: 0 }
    return {
      id: row.id,
      full_name: row.fullName,
      username: row.username,
      email_from_auth: emails.get(row.id),
      avatar_url: row.avatarUrl,
      school: row.school,
      is_active: row.isActive,
      is_founder: row.isFounder,
      reputation_level: row.reputationLevel,
      created_at: row.createdAt.toISOString(),
      approved_count: entry.approved,
      pending_count: entry.pending,
      rejected_count: entry.rejected,
    }
  })
}

export async function toggleUserActiveAction(userId: string, isActive: boolean): Promise<AdminResult> {
  try {
    const admin = await requireFounder()
    if (admin.id === userId) throw new Error("No puedes desactivar tu propia cuenta.")

    const db = getDb()
    const [target] = await db
      .select({ isFounder: profiles.isFounder })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)

    if (!target) throw new Error("Usuario no encontrado")
    if (target.isFounder) throw new Error("No se puede desactivar a otra cuenta fundadora.")

    await db.update(profiles).set({ isActive, updatedAt: new Date() }).where(eq(profiles.id, userId))
    return { success: true }
  } catch (error) {
    return fail(error)
  }
}
