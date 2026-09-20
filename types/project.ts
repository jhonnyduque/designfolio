import type { WorkImage } from "@/types/work"

/** Métricas consistentes en feed, detalle público y dashboard. */
export interface ProjectMetrics {
  likesCount: number
  commentsCount: number
  viewsCount: number
  sharesCount: number
}

export interface ProjectAuthorSummary {
  id: string
  username: string
  fullName: string
  avatarUrl: string | null
  reputationLevel: number
}

export interface PublicProjectAuthor extends ProjectAuthorSummary {
  bio: string | null
  school: string | null
}

export interface ProjectNavigationTarget {
  id: string
  slug: string
}

export interface ProjectNavigation {
  previous: ProjectNavigationTarget | null
  next: ProjectNavigationTarget | null
}

export interface PublicProject {
  id: string
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  media: WorkImage[]
  createdAt: string
  publishedAt: string
}

/** Contrato seguro para cualquier superficie pública de detalle. */
export interface PublicProjectDetail {
  project: PublicProject
  author: PublicProjectAuthor
  metrics: ProjectMetrics
  navigation: ProjectNavigation
}

/** Datos adicionales disponibles dentro del detalle protegido del dashboard. */
export interface DashboardProjectDetail {
  project: PublicProject & {
    moderationStatus: "draft" | "pending_review" | "approved" | "rejected"
    archivedAt: string | null
  }
  author: PublicProjectAuthor
  metrics: ProjectMetrics
  navigation: ProjectNavigation
  viewer: {
    id: string
    isOwner: boolean
    canEdit: boolean
    canArchive: boolean
    canDelete: boolean
  }
}
