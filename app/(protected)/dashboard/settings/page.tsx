// app/(protected)/dashboard/settings/page.tsx
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { EditProfileForm } from "@/components/profile/EditProfileForm"

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, avatar_url, bio, school, career_year, categories, theme_color, onboarding_completed"
    )
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  return <EditProfileForm profile={profile} />
}
