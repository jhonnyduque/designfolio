"use client"

import { useEffect, useState } from "react"
import type { Comment } from "@/types/comment"

type Props = { comments: Comment[]; loading: boolean; onRetry: () => void; error: string | null }

export function CommentList({ comments, loading, onRetry, error }: Props) {
  const [currentTime, setCurrentTime] = useState<number | null>(null)
  useEffect(() => { const frame = window.requestAnimationFrame(() => setCurrentTime(Date.now())); return () => window.cancelAnimationFrame(frame) }, [])
  const getTimeAgo = (value: string) => { if (currentTime === null) return "Ahora"; const minutes = Math.floor((currentTime - new Date(value).getTime()) / 60000); if (minutes < 1) return "Ahora"; if (minutes < 60) return `${minutes}min`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h`; return `${Math.floor(hours / 24)}d` }
  if (loading) return <div className="space-y-3">{[1, 2].map((index) => <div key={index} className="flex animate-pulse gap-3"><div className="h-8 w-8 rounded-full bg-gray-100" /><div className="flex-1 space-y-2"><div className="h-3 w-24 rounded bg-gray-100" /><div className="h-3 w-full rounded bg-gray-100" /></div></div>)}</div>
  if (error) return <div className="py-6 text-center"><p role="alert" className="text-body-sm text-red-600">{error}</p><button type="button" onClick={onRetry} className="mt-2 text-action text-gray-600 underline hover:text-gray-900">Reintentar</button></div>
  if (comments.length === 0) return <p className="py-6 text-center text-body-sm text-gray-400">Aún no hay comentarios. Sé el primero en comentar.</p>
  return <div className="space-y-5">{comments.map((comment) => <div key={comment.id} className="flex gap-3">{comment.author_avatar_url ? <img src={comment.author_avatar_url} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover ring-1 ring-gray-200" /> : <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200"><span className="text-meta font-bold text-gray-500">{comment.author_full_name.charAt(0)}</span></div>}<div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-body-sm font-medium text-gray-900">{comment.author_full_name}</span><span className="text-meta text-gray-400">{getTimeAgo(comment.created_at)}</span></div><p className="mt-1.5 whitespace-pre-wrap text-body-sm text-gray-600">{comment.content}</p></div></div>)}</div>
}
