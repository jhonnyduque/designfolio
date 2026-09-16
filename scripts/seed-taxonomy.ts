/**
 * Siembra las categorías iniciales en `taxonomy`.
 *
 * Uso:  npx tsx --env-file=.env.local scripts/seed-taxonomy.ts
 *
 * Es idempotente: se puede ejecutar las veces que haga falta. Solo inserta las
 * que no existan, y no toca nombres ni orden de las que ya están, para no
 * deshacer cambios hechos desde el panel.
 *
 * Hay que ejecutarlo al preparar una base nueva: sin categorías, la API de
 * creación rechaza cualquier publicación.
 */
import crypto from "crypto"
import { and, eq } from "drizzle-orm"
import { getDb, getPool } from "../lib/db/client"
import { taxonomy } from "../lib/db/schema"
import { WORK_CATEGORIES } from "../types/work"

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

async function main() {
  const db = getDb()
  let created = 0
  let skipped = 0

  for (const [index, name] of WORK_CATEGORIES.entries()) {
    const slug = slugify(name)
    const [existing] = await db
      .select({ id: taxonomy.id })
      .from(taxonomy)
      .where(and(eq(taxonomy.kind, "category"), eq(taxonomy.slug, slug)))
      .limit(1)

    if (existing) {
      skipped += 1
      continue
    }

    await db.insert(taxonomy).values({
      id: crypto.randomUUID(),
      kind: "category",
      name,
      slug,
      sortOrder: index,
    })
    created += 1
  }

  console.log(`Categorías creadas: ${created}. Ya existentes: ${skipped}.`)
  await getPool().end()
}

main().catch(async (error) => {
  console.error("Falló la siembra:", error instanceof Error ? error.message : error)
  process.exit(1)
})
