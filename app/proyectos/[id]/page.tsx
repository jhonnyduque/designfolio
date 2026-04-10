import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WorkDetail } from "@/components/works/WorkDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicWorkPage({ params }: PageProps) {
  const { id: slugOrId } = await params
  const supabase = await createClient()

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      slugOrId
    )

  let work: any = null
  let workError: any = null

  if (isUuid) {
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .eq("id", slugOrId)
      .eq("moderation_status", "approved")
      .single()
    work = data
    workError = error
  } else {
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .eq("slug", slugOrId)
      .eq("moderation_status", "approved")
      .single()
    work = data
    workError = error
  }

  if (workError || !work) {
    notFound()
  }

  if (work.slug && slugOrId !== work.slug) {
    redirect(`/proyectos/${work.slug}`)
  }

  const { data: author } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, reputation_level, bio, school")
    .eq("id", work.author_id)
    .single()

  if (!author) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ count: publicLikes }, { count: publicComments }] = await Promise.all([
    supabase
      .from("public_likes")
      .select("*", { count: "exact", head: true })
      .eq("work_id", work.id),
    supabase
      .from("public_comments")
      .select("*", { count: "exact", head: true })
      .eq("work_id", work.id),
  ])

  const [{ data: prevWork }, { data: nextWork }] = await Promise.all([
    supabase
      .from("works")
      .select("id, slug")
      .eq("moderation_status", "approved")
      .gt("published_at", work.published_at)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("works")
      .select("id, slug")
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
        slug: work.slug ?? null,
        title: work.title,
        description: work.description,
        category: work.category,
        tags: work.tags,
        images: work.images ?? [],
        likes_count: work.likes_count + (publicLikes ?? 0),
        comments_count: work.comments_count + (publicComments ?? 0),
        views_count: work.views_count,
        published_at: work.published_at,
      }}
      author={author}
      currentUserId={user?.id ?? null}
      backHref="/proyectos"
      profileHref={null}
      prevHref={prevWork ? `/proyectos/${prevWork.slug ?? prevWork.id}` : null}
      nextHref={nextWork ? `/proyectos/${nextWork.slug ?? nextWork.id}` : null}
    />
  )
}
