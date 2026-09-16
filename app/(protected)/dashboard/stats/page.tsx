// app/(protected)/dashboard/stats/page.tsx
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { getDashboardWorks } from "@/lib/works/dashboard"
import { AuthorDashboard } from "@/components/profile/AuthorDashboard"

export default async function StatsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")
  const [profile] = await getDb().select({ full_name: profiles.fullName, username: profiles.username, reputation_level: profiles.reputationLevel }).from(profiles).where(eq(profiles.id, session.user.id)).limit(1)
  if (!profile) redirect("/login")
  return <AuthorDashboard profile={{ ...profile, reputation_points: 0 }} works={await getDashboardWorks(session.user.id)} />
}
