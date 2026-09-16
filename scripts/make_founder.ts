/**
 * Promueve o degrada UNA cuenta, identificada por correo.
 *
 * Uso:  npx tsx --env-file=.env.local scripts/make_founder.ts persona@ejemplo.com
 *       npx tsx --env-file=.env.local scripts/make_founder.ts persona@ejemplo.com --demote
 *
 * Solo para entorno local. El correo vive en la tabla `user` de Better Auth,
 * no en `profiles`, por eso se resuelve primero el id y luego se actualiza el perfil.
 */
import { eq } from "drizzle-orm"
import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { getDb, getPool } from "../lib/db/client"
import { profiles } from "../lib/db/schema"

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Abortado: este script no debe ejecutarse en producción.")
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const demote = args.includes("--demote")
  const email = args.find((arg) => !arg.startsWith("--"))?.trim().toLowerCase()
  if (!email) {
    console.error("Falta el correo.\nUso: npx tsx --env-file=.env.local scripts/make_founder.ts persona@ejemplo.com [--demote]")
    process.exit(1)
  }

  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
  if (demote && bootstrapEmail && email === bootstrapEmail) {
    console.error(`Abortado: ${email} es la cuenta de BOOTSTRAP_ADMIN_EMAIL. Degradarla te dejaría sin administrador.`)
    process.exit(1)
  }

  const pool = getPool()
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM `user` WHERE lower(email) = ? LIMIT 1",
    [email],
  )
  const userId = rows[0]?.id as string | undefined
  if (!userId) {
    console.error(`No existe ninguna cuenta con el correo ${email}.`)
    await pool.end()
    process.exit(1)
  }

  const result = await getDb()
    .update(profiles)
    .set({ isFounder: !demote, updatedAt: new Date() })
    .where(eq(profiles.id, userId))

  const affected = (result[0] as ResultSetHeader).affectedRows
  if (affected === 0) {
    console.error(`La cuenta ${email} existe pero no tiene perfil asociado.`)
    await pool.end()
    process.exit(1)
  }

  console.log(demote ? `${email} ya no es fundador.` : `${email} ahora es fundador.`)
  await pool.end()
}

main().catch(async (error) => {
  console.error("Falló la promoción:", error instanceof Error ? error.message : error)
  process.exit(1)
})
