/**
 * Mueve los medios de `public/uploads/` a la raíz persistente y reescribe las
 * URLs guardadas en base (`works.images[].url` y `profiles.avatar_url`).
 *
 * Uso:  npx tsx --env-file=.env.local scripts/migrate-media.ts [--dry-run]
 *
 * Solo hay que ejecutarlo una vez, sobre bases creadas antes del cambio de
 * almacenamiento. Es idempotente: si ya no queda nada en `public/uploads/` y
 * ninguna URL empieza por `/uploads/`, no hace nada.
 */
import { cp, readdir, rm, stat } from "fs/promises"
import path from "path"
import { eq, like } from "drizzle-orm"
import { getDb, getPool } from "../lib/db/client"
import { profiles, works } from "../lib/db/schema"
import { getMediaRoot, MEDIA_URL_PREFIX } from "../lib/media-storage"
import type { WorkImage } from "../types/work"

const OLD_PREFIX = "/uploads/"

async function exists(target: string) {
  try {
    await stat(target)
    return true
  } catch {
    return false
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const legacyRoot = path.join(process.cwd(), "public", "uploads")
  const mediaRoot = getMediaRoot()
  const db = getDb()

  console.log(`Origen : ${legacyRoot}`)
  console.log(`Destino: ${mediaRoot}`)
  if (dryRun) console.log("MODO SIMULACIÓN: no se escribe nada.\n")

  // 1. Mover los archivos
  if (await exists(legacyRoot)) {
    const entries = await readdir(legacyRoot)
    if (entries.length === 0) {
      console.log("No hay archivos que mover.")
    } else if (dryRun) {
      console.log(`Se copiarían ${entries.length} carpeta(s) de usuario.`)
    } else {
      await cp(legacyRoot, mediaRoot, { recursive: true })
      await rm(legacyRoot, { recursive: true, force: true })
      console.log(`Movidas ${entries.length} carpeta(s) de usuario.`)
    }
  } else {
    console.log("No existe public/uploads: nada que mover.")
  }

  // 2. Reescribir las URLs de los medios de proyectos
  const affectedWorks = await db
    .select({ id: works.id, images: works.images })
    .from(works)
    .where(like(works.images, `%"${OLD_PREFIX}%`))

  for (const row of affectedWorks) {
    const images = (row.images ?? []).map((image: WorkImage) => ({
      ...image,
      url: image.url.startsWith(OLD_PREFIX)
        ? `${MEDIA_URL_PREFIX}/${image.url.slice(OLD_PREFIX.length)}`
        : image.url,
    }))
    if (!dryRun) await db.update(works).set({ images }).where(eq(works.id, row.id))
  }
  console.log(`Proyectos con URLs reescritas: ${affectedWorks.length}`)

  // 3. Reescribir los avatares
  const affectedProfiles = await db
    .select({ id: profiles.id, avatarUrl: profiles.avatarUrl })
    .from(profiles)
    .where(like(profiles.avatarUrl, `${OLD_PREFIX}%`))

  for (const row of affectedProfiles) {
    if (!row.avatarUrl) continue
    const avatarUrl = `${MEDIA_URL_PREFIX}/${row.avatarUrl.slice(OLD_PREFIX.length)}`
    if (!dryRun) await db.update(profiles).set({ avatarUrl }).where(eq(profiles.id, row.id))
  }
  console.log(`Avatares reescritos: ${affectedProfiles.length}`)

  await getPool().end()
}

main().catch(async (error) => {
  console.error("Falló la migración de medios:", error instanceof Error ? error.message : error)
  process.exit(1)
})
