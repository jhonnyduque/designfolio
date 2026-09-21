"use client"

import { useEffect } from "react"
import { CommentComposer } from "./CommentComposer"
import { CommentList } from "./CommentList"
import { useComments } from "@/hooks/useComments"

type Props = { workId: string; initialCount: number; open: boolean; onOpen: () => void; onCountChange?: (count: number) => void; compact?: boolean }

/** Experiencia portable de comentarios; F4/F5 podrán montarla sin WorkDetail. */
export function CommentExperience({ workId, initialCount, open, onOpen, onCountChange, compact = false }: Props) {
  const { comments, loading, posting, loadError, postError, cooldownSeconds, post, refresh } = useComments(workId, open)
  const count = comments.length || initialCount
  useEffect(() => { if (open && !loading) onCountChange?.(comments.length) }, [comments.length, loading, onCountChange, open])
  return <div className={compact ? "" : "mt-8 border-t border-gray-100 pt-8"}><div className="mb-5 flex items-center justify-between"><h3 className="text-section text-gray-900">Comentarios <span className="text-body-sm text-gray-400">({count})</span></h3>{!open && <button type="button" onClick={onOpen} className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-action text-white transition-colors hover:bg-gray-800">Ver comentarios</button>}</div>{open && <><CommentComposer posting={posting} cooldownSeconds={cooldownSeconds} error={postError} onSubmit={post} /><CommentList comments={comments} loading={loading} error={loadError} onRetry={refresh} /></>}</div>
}
