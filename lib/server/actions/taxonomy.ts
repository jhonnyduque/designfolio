"use server"

import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { taxonomy } from "@/lib/db/schema"
import { normalizeSlug } from "@/lib/slug"
import type { TagAdmin, TagRpcResult, MergeTagsResult, Tag } from "@/types/tag"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import crypto from "crypto"

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo completar la operación de taxonomía."

// Helper for auth check
async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("No autenticado")
  
  const profile = await getDb().query.profiles.findFirst({
    where: (p, { eq }) => eq(p.id, session.user.id),
  })
  if (!profile?.isFounder) throw new Error("No autorizado")
  return profile
}

export async function getActiveTagsAction(): Promise<Tag[]> {
  const db = getDb()
  const items = await db.query.taxonomy.findMany({
    where: (t, { eq, and, isNull }) => and(eq(t.kind, "tag"), eq(t.active, true), isNull(t.archivedAt)),
  })
  
  return items.map(i => ({
    id: i.id,
    name: i.name,
    slug: i.slug,
    usage_count: 0,
    created_at: i.createdAt.toISOString(),
  }))
}

export async function getAdminTagsAction(): Promise<TagAdmin[]> {
  await requireAdmin()
  const db = getDb()
  const items = await db.query.taxonomy.findMany({
    where: (t, { eq }) => eq(t.kind, "tag"),
  })
  
  return items.map(i => ({
    id: i.id,
    name: i.name,
    slug: i.slug,
    is_active: i.active,
    is_archived: i.archivedAt !== null,
    usage_count: 0,
    created_by: null,
    created_by_name: null,
    created_at: i.createdAt.toISOString(),
    updated_at: i.createdAt.toISOString(),
  }))
}

export async function createTagAction(name: string): Promise<TagRpcResult> {
  try {
    await requireAdmin()
    const db = getDb()
    const slug = normalizeSlug(name)
    
    await db.insert(taxonomy).values({
      id: crypto.randomUUID(),
      kind: "tag",
      name: name.trim(),
      slug,
    })
    
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function renameTagAction(tagId: string, newName: string): Promise<TagRpcResult> {
  try {
    await requireAdmin()
    const db = getDb()
    const slug = normalizeSlug(newName)
    
    await db.update(taxonomy)
      .set({ name: newName.trim(), slug })
      .where(eq(taxonomy.id, tagId))
    
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function toggleTagAction(tagId: string, isActive: boolean): Promise<TagRpcResult> {
  try {
    await requireAdmin()
    const db = getDb()
    
    await db.update(taxonomy)
      .set({ active: isActive })
      .where(eq(taxonomy.id, tagId))
    
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function archiveTagAction(tagId: string): Promise<TagRpcResult> {
  try {
    await requireAdmin()
    const db = getDb()
    
    await db.update(taxonomy)
      .set({ archivedAt: new Date(), active: false })
      .where(eq(taxonomy.id, tagId))
    
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function restoreTagAction(tagId: string): Promise<TagRpcResult> {
  try {
    await requireAdmin()
    const db = getDb()
    
    await db.update(taxonomy)
      .set({ archivedAt: null, active: true })
      .where(eq(taxonomy.id, tagId))
    
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function mergeTagsAction(sourceId: string, targetId: string): Promise<MergeTagsResult> {
  if (sourceId === targetId) {
    return { success: false, error: "El tag de origen y destino deben ser distintos." }
  }
  try {
    await requireAdmin()
    const db = getDb()
    
    await db.update(taxonomy)
      .set({ archivedAt: new Date(), active: false })
      .where(eq(taxonomy.id, sourceId))
      
    return { success: true, moved: 0, duplicates_removed: 0, source_name: "Source", target_name: "Target" }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

/**
 * Categorías y tags activos para el formulario de publicación.
 *
 * Es la fuente de verdad: lo que se ofrece aquí es exactamente lo que la API de
 * creación acepta, así que añadir una categoría en el panel la habilita de
 * inmediato sin tocar código.
 */
export async function getActiveTaxonomyAction(): Promise<{ categories: Tag[]; tags: Tag[] }> {
  const items = await getDb().query.taxonomy.findMany({
    where: (t, { eq, and, isNull }) => and(eq(t.active, true), isNull(t.archivedAt)),
    orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
  })

  const map = (kind: "category" | "tag") =>
    items
      .filter((item) => item.kind === kind)
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        usage_count: 0,
        created_at: item.createdAt.toISOString(),
      }))

  return { categories: map("category"), tags: map("tag") }
}

/** Nombres de categoría aceptables al publicar. Lo usa la API de creación. */
export async function getActiveCategoryNames(): Promise<string[]> {
  const items = await getDb().query.taxonomy.findMany({
    where: (t, { eq, and, isNull }) => and(eq(t.kind, "category"), eq(t.active, true), isNull(t.archivedAt)),
    columns: { name: true },
  })
  return items.map((item) => item.name)
}
