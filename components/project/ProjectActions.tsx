"use client"

import { LikeButton } from "@/components/works/LikeButton"
import { ShareButton } from "@/components/works/ShareButton"

type Props = {
  workId: string
  sharePath: string
  metrics: { likesCount: number; commentsCount: number; viewsCount: number; sharesCount: number }
  variant?: "detail" | "mobile"
  onOpenComments?: () => void
}

/** Acciones públicas. El callback permite que modal y sheet decidan su propia navegación. */
export function ProjectActions({ workId, sharePath, metrics, variant = "detail", onOpenComments }: Props) {
  const compact = variant === "mobile"
  const commentsLabel = metrics.commentsCount === 1 ? "comentario" : "comentarios"
  if (compact) {
    return (
      <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-black/10 bg-white px-4 py-2">
        <LikeButton workId={workId} initialCount={metrics.likesCount} size="sm" />
        <button type="button" onClick={onOpenComments} className="inline-flex items-center gap-1.5 text-meta text-gray-500" aria-label="Abrir comentarios">
          <CommentIcon />
          <span>{metrics.commentsCount}</span>
        </button>
        <ShareButton workId={workId} pathOverride={sharePath} size="sm" iconOnly initialCount={metrics.sharesCount} showCount />
      </div>
    )
  }

  return (
    <div className="mt-6 hidden items-center gap-5 border-t border-gray-100 pt-6 md:flex">
      <LikeButton workId={workId} initialCount={metrics.likesCount} size="md" />
      <button type="button" onClick={onOpenComments} className="flex items-center gap-1.5 text-body-sm text-gray-500 transition-colors hover:text-gray-700" aria-label="Abrir comentarios">
        <CommentIcon large />
        {metrics.commentsCount} {commentsLabel}
      </button>
      {metrics.viewsCount > 0 && <span className="flex items-center gap-1.5 text-body-sm text-gray-500"><EyeIcon />{metrics.viewsCount} vistas</span>}
      <ShareButton workId={workId} pathOverride={sharePath} size="md" iconOnly initialCount={metrics.sharesCount} showCount />
    </div>
  )
}

function CommentIcon({ large = false }: { large?: boolean }) {
  return <svg className={large ? "h-4 w-4" : "h-3.5 w-3.5"} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
}

function EyeIcon() {
  return <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
}
