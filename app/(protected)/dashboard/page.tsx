// app/(protected)/dashboard/page.tsx
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { getResumen } from "@/lib/works/overview"
import { Overview } from "@/components/dashboard/Overview"
import { Feed } from "@/components/feed/Feed"

/**
 * La portada depende del papel de quien entra: quien administra la plataforma
 * necesita saber qué requiere su atención; quien la usa, qué hay de nuevo.
 */
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return <Feed />

  const [perfil] = await getDb()
    .select({ isFounder: profiles.isFounder })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!perfil?.isFounder) return <Feed />

  return <Overview resumen={await getResumen()} />
}
