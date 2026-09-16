// app/(protected)/dashboard/work/[id]/page.tsx
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDashboardWork } from "@/lib/works/dashboard"
import { WorkDetail } from "@/components/works/WorkDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const result = await getDashboardWork(id, session.user.id)
  if (!result) notFound()
  const { work, author, likesCount, commentsCount, previous, next } = result

  return (
    <WorkDetail
      work={{
        id: work.id,
        slug: work.slug ?? null,
        title: work.title,
        description: work.description,
        category: work.category,
        tags: work.tags ?? [],
        images: work.images,
        likes_count: likesCount,
        comments_count: commentsCount,
        views_count: work.viewsCount,
        published_at: (work.publishedAt ?? work.createdAt).toISOString(),
      }}
      author={{
        id: author.id,
        username: author.username,
        full_name: author.fullName,
        avatar_url: author.avatarUrl,
        reputation_level: author.reputationLevel,
        bio: author.bio,
        school: author.school,
      }}
      currentUserId={session.user.id}
      prevHref={previous ? `/dashboard/work/${previous.id}` : null}
      nextHref={next ? `/dashboard/work/${next.id}` : null}
    />
  )
}
