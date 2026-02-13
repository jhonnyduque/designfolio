// app/(protected)/dashboard/profile/[username]/page.tsx
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { UserProfile } from "@/components/profile/UserProfile"

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createServerSupabaseClient()

  // Fetch profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, avatar_url, bio, school, career_year, categories, reputation_level, total_points, created_at"
    )
    .eq("username", username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Fetch user's approved works
  const { data: works } = await supabase
    .from("works")
    .select("id, title, category, images, likes_count, comments_count, published_at")
    .eq("author_id", profile.id)
    .eq("moderation_status", "approved")
    .order("published_at", { ascending: false })

  return <UserProfile profile={profile} works={works ?? []} />
}
