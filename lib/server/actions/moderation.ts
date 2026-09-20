"use server"

import { asc, eq, desc, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { works, moderationLog, notifications, profiles } from "@/lib/db/schema"
import type { ModerationWork, ModerationLogEntry, ModerationResult } from "@/types/moderation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import crypto from "crypto"

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo completar la moderación."

async function requireAdmin() {
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

export async function getModerationQueueAction(): Promise<ModerationWork[]> {
  await requireAdmin()
  const db = getDb()
  
  // Join explícito y no la API relacional de Drizzle: `with: { author: true }`
  // exige declarar relations() en el esquema, y aquí no hay ninguna. Sin ellas
  // falla en tiempo de ejecución con "Cannot read properties of undefined
  // (reading 'referencedTable')", que el compilador no detecta.
  const items = await db
    .select({
      id: works.id,
      authorId: works.authorId,
      title: works.title,
      description: works.description,
      category: works.category,
      tags: works.tags,
      images: works.images,
      moderationStatus: works.moderationStatus,
      createdAt: works.createdAt,
      publishedAt: works.publishedAt,
      authorUsername: profiles.username,
      authorFullName: profiles.fullName,
      authorAvatarUrl: profiles.avatarUrl,
      authorReputationLevel: profiles.reputationLevel,
    })
    .from(works)
    .innerJoin(profiles, eq(works.authorId, profiles.id))
    .where(eq(works.moderationStatus, "pending_review"))
    .orderBy(asc(works.createdAt))

  return items.map((w) => ({
    id: w.id,
    author_id: w.authorId,
    title: w.title,
    description: w.description,
    category: w.category,
    tags: w.tags,
    images: w.images ?? [],
    moderation_status: w.moderationStatus,
    created_at: w.createdAt.toISOString(),
    published_at: w.publishedAt?.toISOString() ?? null,
    author_username: w.authorUsername,
    author_full_name: w.authorFullName,
    author_avatar_url: w.authorAvatarUrl,
    author_reputation_level: w.authorReputationLevel,
  }))
}

export async function getModerationStatsAction() {
  await requireAdmin()
  const db = getDb()
  
  const result = await db.select({
    status: works.moderationStatus,
    count: sql<number>`count(*)`
  }).from(works).groupBy(works.moderationStatus)
  
  const stats = { pending: 0, approved: 0, rejected: 0 }
  for (const r of result) {
    if (r.status === "pending_review") stats.pending = Number(r.count)
    if (r.status === "approved") stats.approved = Number(r.count)
    if (r.status === "rejected") stats.rejected = Number(r.count)
  }
  return stats
}

export async function getModerationHistoryAction(): Promise<ModerationLogEntry[]> {
  await requireAdmin()
  const db = getDb()
  
  const rows = await db
    .select({
      id: moderationLog.id,
      workId: moderationLog.workId,
      workTitle: moderationLog.workTitle,
      actorName: profiles.fullName,
      action: moderationLog.action,
      note: moderationLog.note,
      createdAt: moderationLog.createdAt,
    })
    .from(moderationLog)
    .innerJoin(profiles, eq(moderationLog.actorId, profiles.id))
    .orderBy(desc(moderationLog.createdAt))
    .limit(50)

  return rows.map((row) => ({
    id: row.id,
    work_id: row.workId,
    work_title: row.workTitle,
    actor_name: row.actorName,
    action: row.action,
    note: row.note,
    created_at: row.createdAt.toISOString(),
  }))
}

export async function moderateWorkAction(workId: string, action: "approve" | "reject", note?: string): Promise<ModerationResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    
    const [work] = await db
      .select({ title: works.title, authorId: works.authorId })
      .from(works)
      .where(eq(works.id, workId))
      .limit(1)
    
    if (!work) throw new Error("Obra no encontrada")
    
    const status = action === "approve" ? "approved" : "rejected"
    const publishedAt = action === "approve" ? new Date() : null
    
    await db.update(works).set({
      moderationStatus: status,
      ...(publishedAt ? { publishedAt } : {})
    }).where(eq(works.id, workId))
    
    await db.insert(moderationLog).values({
      id: crypto.randomUUID(),
      workId,
      workTitle: work.title,
      actorId: admin.id,
      action,
      note: note || null,
    })
    
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId: work.authorId,
      type: action === "approve" ? "work_approved" : "work_rejected",
      targetId: workId,
      payload: { title: work.title, note: note || null }
    })
    
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
