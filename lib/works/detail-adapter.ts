import type { DashboardProjectDetail, PublicProjectDetail } from "@/types/project"

/**
 * Forma temporal que consume el renderer heredado WorkDetail.
 *
 * Mantenerla fuera de los contratos de dominio evita que el detalle público y
 * el protegido se diseñen alrededor del componente que F2 separará.
 */
export function toLegacyWorkDetailData(detail: PublicProjectDetail | DashboardProjectDetail) {
  const { project, author, metrics } = detail

  return {
    work: {
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags,
      images: project.media,
      likes_count: metrics.likesCount,
      comments_count: metrics.commentsCount,
      views_count: metrics.viewsCount,
      shares_count: metrics.sharesCount,
      published_at: project.publishedAt,
    },
    author: {
      id: author.id,
      username: author.username,
      full_name: author.fullName,
      avatar_url: author.avatarUrl,
      reputation_level: author.reputationLevel,
      bio: author.bio,
      school: author.school,
    },
  }
}
