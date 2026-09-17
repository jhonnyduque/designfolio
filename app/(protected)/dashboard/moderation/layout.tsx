// app/(protected)/dashboard/moderation/layout.tsx
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"

/**
 * Único punto donde se comprueba el permiso de fundador para toda la sección.
 *
 * Antes cada página repetía la comprobación por su cuenta, y la de taxonomía se
 * había quedado sin ella: cualquier miembro con sesión podía abrirla. Las server
 * actions sí verificaban, así que no se filtraban datos, pero la página no debía
 * llegar a renderizarse.
 */
export default async function ModerationLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const [profile] = await getDb()
    .select({ isFounder: profiles.isFounder, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!profile?.isFounder || !profile.isActive) redirect("/dashboard")

  return <>{children}</>
}
