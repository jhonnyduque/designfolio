// app/(protected)/dashboard/moderation/page.tsx
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { ModerationPanel } from "@/components/moderation/ModerationPanel"

export default async function ModerationPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const [profile] = await getDb()
    .select({ isFounder: profiles.isFounder, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!profile?.isFounder || !profile.isActive) redirect("/dashboard")

  return <ModerationPanel />
}
