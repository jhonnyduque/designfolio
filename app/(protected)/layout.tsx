import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
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

  return (
    <DashboardShell email={session.user.email} isFounder={profile.isFounder}>
      {children}
    </DashboardShell>
  )
}
