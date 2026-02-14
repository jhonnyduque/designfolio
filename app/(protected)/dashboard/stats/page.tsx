// app/(protected)/dashboard/stats/page.tsx
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AuthorDashboard } from "@/components/profile/AuthorDashboard"

export default async function StatsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, reputation_level, reputation_points")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  const { data: works } = await supabase
    .from("works")
    .select(
      "id, title, category, images, moderation_status, likes_count, comments_count, views_count, published_at, created_at"
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  return <AuthorDashboard profile={profile} works={works ?? []} />
}
