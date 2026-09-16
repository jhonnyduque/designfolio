// app/(protected)/dashboard/profile/[username]/page.tsx
import { notFound } from "next/navigation"
import { getProfileByUsername } from "@/lib/works/dashboard"
import { UserProfile } from "@/components/profile/UserProfile"

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const result = await getProfileByUsername(username)
  if (!result) notFound()
  const { profile, works } = result

  return (
    <UserProfile
      profile={{
        id: profile.id,
        username: profile.username,
        full_name: profile.fullName,
        avatar_url: profile.avatarUrl,
        bio: profile.bio,
        school: profile.school,
        career_year: profile.careerYear,
        categories: profile.categories,
        reputation_level: profile.reputationLevel,
        created_at: profile.createdAt.toISOString(),
      }}
      works={works}
    />
  )
}
