// app/(protected)/dashboard/work/[id]/page.tsx
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { WorkDetail } from "@/components/works/WorkDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  // Fetch work
  const { data: work, error } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .eq("moderation_status", "approved")
    .single()

  if (error || !work) {
    notFound()
  }

  // Fetch author profile
  const { data: author } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, reputation_level, bio, school")
    .eq("id", work.author_id)
    .single()

  if (!author) {
    notFound()
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <WorkDetail
      work={{
        id: work.id,
        title: work.title,
        description: work.description,
        category: work.category,
        tags: work.tags,
        images: work.images ?? [],
        likes_count: work.likes_count,
        comments_count: work.comments_count,
        views_count: work.views_count,
        published_at: work.published_at,
      }}
      author={author}
      currentUserId={user?.id ?? null}
    />
  )
}
