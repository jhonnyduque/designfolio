// app/(protected)/dashboard/settings/page.tsx
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { EditProfileForm } from "@/components/profile/EditProfileForm"

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")
  const [profile] = await getDb().select({
    id: profiles.id,
    username: profiles.username,
    full_name: profiles.fullName,
    avatar_url: profiles.avatarUrl,
    bio: profiles.bio,
    school: profiles.school,
    career_year: profiles.careerYear,
    categories: profiles.categories,
    theme_color: profiles.themeColor,
    onboarding_completed: profiles.onboardingCompleted,
  }).from(profiles).where(eq(profiles.id, session.user.id)).limit(1)
  if (!profile) redirect("/login")
  return <EditProfileForm profile={profile} />
}
