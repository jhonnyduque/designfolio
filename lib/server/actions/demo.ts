"use server"

import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { borrarDemo, contarDemo, crearDemo } from "@/lib/demo/seed"

/**
 * Carga y retirada de los datos de demostración desde el panel.
 *
 * Existe porque importar el volcado desde fuera obliga a manejar la contraseña
 * de la base; aquí la aplicación ya la tiene. Lo que se ejecuta es el mismo
 * generador que usa el CLI —inserciones parametrizadas vía Drizzle, sin SQL
 * construido a mano— y solo lo alcanza una cuenta fundadora activa.
 */

export type ResultadoDemo = { success: boolean; error?: string; detalle?: string }

async function requireFounder() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("No autenticado")

  const [perfil] = await getDb()
    .select({ id: profiles.id, isFounder: profiles.isFounder, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!perfil?.isFounder || !perfil.isActive) throw new Error("No autorizado")
  return perfil
}

export async function estadoDemoAction(): Promise<{ perfiles: number; obras: number }> {
  await requireFounder()
  return contarDemo()
}

export async function importarDemoAction(): Promise<ResultadoDemo> {
  try {
    await requireFounder()
    await crearDemo()
    const ahora = await contarDemo()
    return { success: true, detalle: `${ahora.perfiles} perfiles y ${ahora.obras} publicaciones` }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado" }
  }
}

export async function quitarDemoAction(): Promise<ResultadoDemo> {
  try {
    await requireFounder()
    await borrarDemo()
    const ahora = await contarDemo()
    if (ahora.perfiles > 0) return { success: false, error: `Todavía quedan ${ahora.perfiles} perfiles.` }
    return { success: true, detalle: "No queda nada de demostración" }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado" }
  }
}
