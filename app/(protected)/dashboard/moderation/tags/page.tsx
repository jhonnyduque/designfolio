import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { TagsModerationPanel } from "@/components/moderation/TagsModerationPanel"

export const metadata = {
  title: "Moderación de Tags — Designfolio",
}

export default async function TagsModerationPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const [profile] = await getDb().select({
    isFounder: profiles.isFounder,
  }).from(profiles).where(eq(profiles.id, session.user.id)).limit(1)

  if (!profile?.isFounder) redirect("/dashboard")

  return (
    <div className="py-8 px-4">
      <TagsModerationPanel />
    </div>
  )
}
