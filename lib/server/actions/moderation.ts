"use server"

import { eq, desc, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { works, moderationLog, notifications, profiles } from "@/lib/db/schema"
import type { ModerationWork, ModerationLogEntry, ModerationResult } from "@/types/moderation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import crypto from "crypto"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("No autenticado")
  
  const profile = await getDb().query.profiles.findFirst({
    where: (p, { eq }) => eq(p.id, session.user.id),
  })
  if (!profile?.isFounder) throw new Error("No autorizado")
  return profile
}

export async function getModerationQueueAction(): Promise<ModerationWork[]> {
  await requireAdmin()
  const db = getDb()
  
  const items = await db.query.works.findMany({
    where: (w, { eq }) => eq(w.moderationStatus, "pending_review"),
    with: {
      author: true
    },
    orderBy: (w, { asc }) => [asc(w.createdAt)],
  })
  
  return items.map(w => ({
    id: w.id,
    author_id: w.authorId,
    title: w.title,
    description: w.description,
    category: w.category,
    tags: w.tags,
    images: w.images,
    moderation_status: w.moderationStatus,
    created_at: w.createdAt.toISOString(),
    published_at: w.publishedAt?.toISOString() || null,
    author_username: (w as any).author?.username || "",
    author_full_name: (w as any).author?.fullName || "Unknown",
    author_avatar_url: (w as any).author?.avatarUrl || null,
    author_reputation_level: (w as any).author?.reputationLevel || 0,
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
  
  const items = await db.query.notifications.findMany({
    where: (n, { inArray }) => inArray(n.type, ["work_approved", "work_rejected"]),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 20
  })
  
  return items.map(n => ({
    id: n.id,
    user_id: n.userId,
    type: n.type,
    target_id: n.targetId,
    payload: n.payload,
    read_at: n.readAt?.toISOString() || null,
    created_at: n.createdAt.toISOString()
  })) as ModerationLogEntry[]
}

export async function moderateWorkAction(workId: string, action: "approve" | "reject", note?: string): Promise<ModerationResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    
    const work = await db.query.works.findFirst({
      where: eq(works.id, workId)
    })
    
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
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
