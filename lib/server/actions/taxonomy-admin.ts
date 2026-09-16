"use server"

import crypto from "crypto"
import { and, asc, eq, ne, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles, taxonomy, works } from "@/lib/db/schema"
import type { TaxonomyAdmin, TaxonomyRpcResult, MergeTaxonomyResult } from "@/types/taxonomy"

type Kind = "category" | "tag"

const NAME_MAX = 80

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

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

function validateName(name: string) {
  const clean = name.trim()
  if (clean.length < 2 || clean.length > NAME_MAX) {
    throw new Error(`El nombre debe tener entre 2 y ${NAME_MAX} caracteres.`)
  }
  const slug = slugify(clean)
  if (!slug) throw new Error("El nombre debe contener al menos una letra o número.")
  return { name: clean, slug }
}

function ok(extra: Partial<TaxonomyRpcResult> = {}): TaxonomyRpcResult {
  return { success: true, ...extra }
}

function fail(error: unknown): TaxonomyRpcResult {
  return { success: false, error: error instanceof Error ? error.message : "Error inesperado" }
}

/**
 * Cuántos proyectos usan cada término.
 *
 * Las categorías se guardan como texto en `works.category`; los tags, dentro del
 * array JSON `works.tags`. Por eso cada tipo se cuenta de una forma distinta.
 */
async function usageByName(): Promise<Map<string, number>> {
  const db = getDb()
  const [categoryRows, tagRows] = await Promise.all([
    db.select({ name: works.category, count: sql<number>`count(*)` })
      .from(works).groupBy(works.category),
    // coalesce: JSON_TABLE lanza error si el argumento es NULL, y `tags` lo admite.
    db.select({ name: sql<string>`jt.tag`, count: sql<number>`count(*)` })
      .from(sql`${works} join json_table(coalesce(${works.tags}, json_array()), '$[*]' columns (tag varchar(80) path '$')) as jt`)
      .groupBy(sql`jt.tag`),
  ])

  const usage = new Map<string, number>()
  for (const row of categoryRows) {
    if (row.name) usage.set(`category:${row.name.toLowerCase()}`, Number(row.count))
  }
  for (const row of tagRows) {
    if (row.name) usage.set(`tag:${row.name.toLowerCase()}`, Number(row.count))
  }
  return usage
}

export async function getTaxonomyAdminAction(): Promise<TaxonomyAdmin[]> {
  await requireFounder()
  const db = getDb()

  const [rows, usage] = await Promise.all([
    db.select({
      id: taxonomy.id,
      kind: taxonomy.kind,
      name: taxonomy.name,
      slug: taxonomy.slug,
      active: taxonomy.active,
      sortOrder: taxonomy.sortOrder,
      createdBy: taxonomy.createdBy,
      createdByName: profiles.fullName,
      createdAt: taxonomy.createdAt,
      updatedAt: taxonomy.updatedAt,
      archivedAt: taxonomy.archivedAt,
    })
      .from(taxonomy)
      .leftJoin(profiles, eq(taxonomy.createdBy, profiles.id))
      .orderBy(asc(taxonomy.kind), asc(taxonomy.sortOrder), asc(taxonomy.name)),
    usageByName(),
  ])

  return rows.map((row) => ({
    id: row.id,
    type: row.kind,
    name: row.name,
    slug: row.slug,
    usage_count: usage.get(`${row.kind}:${row.name.toLowerCase()}`) ?? 0,
    sort_order: row.sortOrder,
    created_at: row.createdAt.toISOString(),
    is_active: row.active,
    is_archived: row.archivedAt !== null,
    created_by: row.createdBy,
    created_by_name: row.createdByName ?? null,
    updated_at: row.updatedAt.toISOString(),
  }))
}

export async function createTaxonomyAction(kind: Kind, rawName: string): Promise<TaxonomyRpcResult> {
  try {
    const founder = await requireFounder()
    const { name, slug } = validateName(rawName)
    const db = getDb()

    const [existing] = await db.select({ id: taxonomy.id })
      .from(taxonomy).where(and(eq(taxonomy.kind, kind), eq(taxonomy.slug, slug))).limit(1)
    if (existing) throw new Error(`Ya existe un término con el nombre "${name}".`)

    const [last] = await db.select({ max: sql<number>`coalesce(max(${taxonomy.sortOrder}), -1)` })
      .from(taxonomy).where(eq(taxonomy.kind, kind))

    const id = crypto.randomUUID()
    await db.insert(taxonomy).values({
      id,
      kind,
      name,
      slug,
      sortOrder: Number(last?.max ?? -1) + 1,
      createdBy: founder.id,
    })

    return ok({ id, name, slug })
  } catch (error) {
    return fail(error)
  }
}

export async function renameTaxonomyAction(id: string, rawName: string): Promise<TaxonomyRpcResult> {
  try {
    await requireFounder()
    const { name, slug } = validateName(rawName)
    const db = getDb()

    const [current] = await db.select().from(taxonomy).where(eq(taxonomy.id, id)).limit(1)
    if (!current) throw new Error("Término no encontrado")

    const [clash] = await db.select({ id: taxonomy.id }).from(taxonomy)
      .where(and(eq(taxonomy.kind, current.kind), eq(taxonomy.slug, slug), ne(taxonomy.id, id))).limit(1)
    if (clash) throw new Error(`Ya existe un término con el nombre "${name}".`)

    await db.update(taxonomy).set({ name, slug, updatedAt: new Date() }).where(eq(taxonomy.id, id))
    return ok({ id, old_name: current.name, new_name: name, slug })
  } catch (error) {
    return fail(error)
  }
}

export async function toggleTaxonomyAction(id: string, isActive: boolean): Promise<TaxonomyRpcResult> {
  try {
    await requireFounder()
    const result = await getDb().update(taxonomy)
      .set({ active: isActive, updatedAt: new Date() }).where(eq(taxonomy.id, id))
    if (result[0].affectedRows !== 1) throw new Error("Término no encontrado")
    return ok({ id, is_active: isActive })
  } catch (error) {
    return fail(error)
  }
}

export async function archiveTaxonomyAction(id: string): Promise<TaxonomyRpcResult> {
  try {
    await requireFounder()
    const result = await getDb().update(taxonomy)
      .set({ archivedAt: new Date(), active: false, updatedAt: new Date() })
      .where(eq(taxonomy.id, id))
    if (result[0].affectedRows !== 1) throw new Error("Término no encontrado")
    return ok({ id })
  } catch (error) {
    return fail(error)
  }
}

export async function restoreTaxonomyAction(id: string): Promise<TaxonomyRpcResult> {
  try {
    await requireFounder()
    const result = await getDb().update(taxonomy)
      .set({ archivedAt: null, active: true, updatedAt: new Date() })
      .where(eq(taxonomy.id, id))
    if (result[0].affectedRows !== 1) throw new Error("Término no encontrado")
    return ok({ id })
  } catch (error) {
    return fail(error)
  }
}

/**
 * Fusiona dos términos del mismo tipo: reescribe los proyectos que usaban el
 * origen para que apunten al destino, y archiva el origen.
 */
export async function mergeTaxonomyAction(sourceId: string, targetId: string): Promise<MergeTaxonomyResult> {
  try {
    await requireFounder()
    if (sourceId === targetId) throw new Error("No puedes fusionar un término consigo mismo.")
    const db = getDb()

    const [source] = await db.select().from(taxonomy).where(eq(taxonomy.id, sourceId)).limit(1)
    const [target] = await db.select().from(taxonomy).where(eq(taxonomy.id, targetId)).limit(1)
    if (!source || !target) throw new Error("Alguno de los términos no existe.")
    if (source.kind !== target.kind) throw new Error("Solo se pueden fusionar términos del mismo tipo.")

    let moved = 0
    if (source.kind === "category") {
      const result = await db.update(works)
        .set({ category: target.name, updatedAt: new Date() })
        .where(eq(works.category, source.name))
      moved = result[0].affectedRows
    } else {
      // La reescritura del array JSON se hace en código y no en SQL: manipular
      // works.tags con JSON_TABLE dentro de un UPDATE sobre la propia tabla es
      // frágil y además falla cuando tags es NULL.
      const affected = await db
        .select({ id: works.id, tags: works.tags })
        .from(works)
        .where(sql`json_contains(coalesce(${works.tags}, json_array()), json_quote(${source.name}))`)

      for (const row of affected) {
        const merged = Array.from(
          new Set((row.tags ?? []).map((tag) => (tag === source.name ? target.name : tag))),
        )
        await db.update(works).set({ tags: merged, updatedAt: new Date() }).where(eq(works.id, row.id))
      }
      moved = affected.length
    }

    await db.update(taxonomy)
      .set({ archivedAt: new Date(), active: false, updatedAt: new Date() })
      .where(eq(taxonomy.id, sourceId))

    return {
      success: true,
      source_name: source.name,
      target_name: target.name,
      moved,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    }
  }
}

/** Intercambia la posición con el término vecino del mismo tipo. */
export async function reorderTaxonomyAction(id: string, direction: "up" | "down"): Promise<TaxonomyRpcResult> {
  try {
    await requireFounder()
    const db = getDb()

    const [current] = await db.select().from(taxonomy).where(eq(taxonomy.id, id)).limit(1)
    if (!current) throw new Error("Término no encontrado")

    const siblings = await db.select({ id: taxonomy.id, sortOrder: taxonomy.sortOrder })
      .from(taxonomy).where(eq(taxonomy.kind, current.kind))
      .orderBy(asc(taxonomy.sortOrder), asc(taxonomy.name))

    const index = siblings.findIndex((s) => s.id === id)
    const swapWith = direction === "up" ? siblings[index - 1] : siblings[index + 1]
    if (!swapWith) return ok({ id, direction })

    await Promise.all([
      db.update(taxonomy).set({ sortOrder: swapWith.sortOrder, updatedAt: new Date() }).where(eq(taxonomy.id, id)),
      db.update(taxonomy).set({ sortOrder: current.sortOrder, updatedAt: new Date() }).where(eq(taxonomy.id, swapWith.id)),
    ])

    return ok({ id, direction })
  } catch (error) {
    return fail(error)
  }
}
