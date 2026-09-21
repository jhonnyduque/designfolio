import { headers } from "next/headers"
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { PublicShell } from "@/components/layout/PublicShell"
import type { SesionPublica } from "@/components/layout/PublicMenu"
import { COOKIE_CONSENT_NAME, readCookieConsent } from "@/lib/cookie-consent"

/**
 * El layout de todo lo público: feed, detalle de proyecto y legales.
 *
 * La sesión se lee aquí una sola vez, para el menú y para identificar de forma
 * contextual las publicaciones del propietario. La API sigue siendo la
 * autoridad que valida cualquier acción protegida.
 */
async function sesionActual(): Promise<SesionPublica> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [perfil] = await getDb()
    .select({ username: profiles.username, fullName: profiles.fullName, avatarUrl: profiles.avatarUrl })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!perfil) return null
  return {
    id: session.user.id,
    nombre: perfil.fullName,
    username: perfil.username,
    avatarUrl: perfil.avatarUrl,
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  return (
    <PublicShell
      sesion={await sesionActual()}
      cookieConsent={readCookieConsent(cookieStore.get(COOKIE_CONSENT_NAME)?.value)}
    >
      {children}
    </PublicShell>
  )
}
