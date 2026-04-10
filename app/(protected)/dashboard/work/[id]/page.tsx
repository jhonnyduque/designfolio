// app/(protected)/dashboard/work/[id]/page.tsx
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkDetail } from "@/components/works/WorkDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

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

  const [{ data: prevWork }, { data: nextWork }] = await Promise.all([
    supabase
      .from("works")
      .select("id")
      .eq("moderation_status", "approved")
      .gt("published_at", work.published_at)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("works")
      .select("id")
      .eq("moderation_status", "approved")
      .lt("published_at", work.published_at)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

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
      prevHref={prevWork ? `/dashboard/work/${prevWork.id}` : null}
      nextHref={nextWork ? `/dashboard/work/${nextWork.id}` : null}
    />
  )
}
