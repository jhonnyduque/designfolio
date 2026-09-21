import { notFound, redirect } from "next/navigation"
import { getPublicWork } from "@/lib/works/public"
import { PublicPost } from "@/components/feed/PublicPost"
import type { FeedItem } from "@/types/feed"

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Publicación individual compartible.
 *
 * Conserva una URL canónica propia, pero visualmente se presenta como un
 * mini-feed de una sola publicación. El dashboard mantiene su WorkDetail
 * independiente, con edición y acciones de propietario.
 */
export default async function PublicWorkPage({ params }: PageProps) {
  const { id: slugOrId } = await params
  const result = await getPublicWork(slugOrId)
  if (!result) notFound()

  const canonicalId = result.project.slug ?? result.project.id
  if (slugOrId !== canonicalId) {
    redirect(`/proyectos/${canonicalId}`)
  }

  const item: FeedItem = {
    id: result.project.id,
    slug: result.project.slug,
    author_id: result.author.id,
    title: result.project.title,
    description: result.project.description,
    category: result.project.category,
    images: result.project.media,
    likes_count: result.metrics.likesCount,
    comments_count: result.metrics.commentsCount,
    views_count: result.metrics.viewsCount,
    shares_count: result.metrics.sharesCount,
    created_at: result.project.createdAt,
    published_at: result.project.publishedAt,
    author_username: result.author.username,
    author_full_name: result.author.fullName,
    author_avatar_url: result.author.avatarUrl,
    author_reputation_level: result.author.reputationLevel,
  }

  return <PublicPost item={item} />
}
