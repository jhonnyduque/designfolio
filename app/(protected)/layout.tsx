import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles, works } from "@/lib/db/schema"
import { DashboardShell } from "./DashboardShell"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const [profile] = await getDb().select({
    isFounder: profiles.isFounder,
    isActive: profiles.isActive,
    onboardingCompleted: profiles.onboardingCompleted,
  }).from(profiles).where(eq(profiles.id, session.user.id)).limit(1)

  if (!profile?.isActive) redirect("/login")
  if (!profile.onboardingCompleted) redirect("/onboarding")

  // El contador de la barra lateral. Solo se consulta para fundadores: al resto
  // no se les muestra esa sección.
  let pendingCount = 0
  if (profile.isFounder) {
    const [fila] = await getDb()
      .select({ total: sql<number>`count(*)` })
      .from(works)
      .where(eq(works.moderationStatus, "pending_review"))
    pendingCount = Number(fila?.total ?? 0)
  }

  return (
    <DashboardShell email={session.user.email} isFounder={profile.isFounder} pendingCount={pendingCount}>
      {children}
    </DashboardShell>
  )
}
