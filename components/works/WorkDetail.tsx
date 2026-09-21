"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CommentExperience } from "@/components/comments/CommentExperience"
import { ProjectActions } from "@/components/project/ProjectActions"
import { ProjectAuthor } from "@/components/project/ProjectAuthor"
import { ProjectDescription } from "@/components/project/ProjectDescription"
import { ProjectHeader } from "@/components/project/ProjectHeader"
import { ProjectMedia, type ProjectMediaItem } from "@/components/project/ProjectMedia"
import { trackView } from "@/lib/client/track-view"
import { DETAIL_VIEW_DELAY_MS } from "@/lib/views"

interface WorkDetailProps {
  work: { id: string; slug?: string | null; title: string; description: string; category: string; tags: string[] | null; images: ProjectMediaItem[]; likes_count: number; comments_count: number; views_count: number; shares_count: number; published_at: string }
  author: { id: string; username: string; full_name: string; avatar_url: string | null; reputation_level: number; bio: string | null; school: string | null }
  currentUserId?: string | null
  backHref?: string
  profileHref?: string | null
  siteHref?: string | null
  prevHref?: string | null
  nextHref?: string | null
  trackView?: boolean
}

/** Compone el single y sus acciones exclusivas de propietario. */
export function WorkDetail({ work, author, currentUserId, backHref = "/dashboard", profileHref = `/dashboard/profile/${author.username}`, siteHref = null, prevHref = null, nextHref = null, trackView: shouldTrackView = false }: WorkDetailProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(work.title)
  const [editDescription, setEditDescription] = useState(work.description)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(work.title)
  const [description, setDescription] = useState(work.description)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [viewsCount, setViewsCount] = useState(work.views_count)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const router = useRouter()
  const isOwner = currentUserId === author.id

  useEffect(() => {
    if (!shouldTrackView) return
    let timer: number | null = null
    const scheduleView = () => {
      if (timer) window.clearTimeout(timer)
      if (document.visibilityState !== "visible") return
      timer = window.setTimeout(() => { void trackView(work.id, "detail_page").then((result) => { if (result) setViewsCount(result.viewsCount) }) }, DETAIL_VIEW_DELAY_MS)
    }
    scheduleView()
    document.addEventListener("visibilitychange", scheduleView)
    return () => { if (timer) window.clearTimeout(timer); document.removeEventListener("visibilitychange", scheduleView) }
  }, [shouldTrackView, work.id])

  const handleSaveEdit = useCallback(async () => {
    if (!editTitle.trim()) return
    setSaving(true); setActionError(null)
    try {
      const response = await fetch(`/api/works/${work.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editTitle.trim(), description: editDescription.trim() }) })
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error ?? "No se pudieron guardar los cambios.") }
      setTitle(editTitle.trim()); setDescription(editDescription.trim()); setEditing(false); router.refresh()
    } catch (error) { setActionError(error instanceof Error ? error.message : "No se pudieron guardar los cambios.") } finally { setSaving(false) }
  }, [editDescription, editTitle, router, work.id])

  const handleArchive = useCallback(async () => {
    setActionLoading(true); setActionError(null)
    try {
      const response = await fetch(`/api/works/${work.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived: true }) })
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error ?? "No se pudo archivar el proyecto.") }
      router.push("/dashboard/my-works")
    } catch (error) { setActionError(error instanceof Error ? error.message : "No se pudo archivar el proyecto."); setActionLoading(false) }
  }, [router, work.id])

  const handleDelete = useCallback(async () => {
    setActionLoading(true); setActionError(null)
    try {
      const response = await fetch(`/api/works/${work.id}`, { method: "DELETE" })
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error ?? "No se pudo eliminar el proyecto.") }
      router.push("/dashboard/my-works")
    } catch (error) { setActionError(error instanceof Error ? error.message : "No se pudo eliminar el proyecto."); setActionLoading(false); setConfirmDelete(false) }
  }, [router, work.id])

  const openComments = useCallback(() => {
    setCommentsOpen(true)
    window.requestAnimationFrame(() => document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }, [])
  const metrics = { likesCount: work.likes_count, commentsCount: work.comments_count, viewsCount, sharesCount: work.shares_count }
  const sharePath = `/proyectos/${work.slug ?? work.id}`

  return <div className="pb-20 md:pb-0">
    <div className="mb-6 flex items-center justify-between gap-4">
      <Link href={backHref} className="inline-flex items-center gap-1 text-action text-gray-500 transition-colors hover:text-gray-700">← Volver al feed</Link>
      {siteHref && <a href={siteHref} target="_blank" rel="noreferrer" className="shrink-0 text-action text-gray-500 transition-colors hover:text-gray-700">Volver a jhonnyduque.com</a>}
    </div>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
      <div><ProjectMedia media={work.images} alt={title} />
        <div className="mt-8">
          {editing ? <div className="space-y-4">
            <div><label className="mb-1 block text-label text-gray-500">Título</label><input type="text" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-section text-gray-900 outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900" /></div>
            <div><label className="mb-1 block text-label text-gray-500">Descripción</label><textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={5} className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-body-sm text-gray-900 outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900" /></div>
            <div className="flex gap-2"><button onClick={handleSaveEdit} disabled={saving || !editTitle.trim()} className="rounded-lg bg-gray-900 px-4 py-2 text-action text-white transition-colors hover:bg-gray-800 disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button><button onClick={() => { setEditing(false); setEditTitle(title); setEditDescription(description) }} className="rounded-lg px-4 py-2 text-action text-gray-600 transition-colors hover:bg-gray-100">Cancelar</button></div>
            {actionError && <p role="alert" className="text-body-sm text-red-600">{actionError}</p>}
          </div> : <><ProjectHeader title={title} category={work.category} publishedAt={work.published_at} /><ProjectDescription>{description}</ProjectDescription></>}
          <ProjectActions workId={work.id} sharePath={sharePath} metrics={metrics} onOpenComments={openComments} />
          {isOwner && !editing && actionError && <p role="alert" className="mt-4 text-body-sm text-red-600">{actionError}</p>}
          {isOwner && !editing && <div className="mt-4 flex items-center gap-1 border-t border-gray-100 pt-4">
            <button onClick={() => setEditing(true)} title="Editar" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"><svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button>
            <button onClick={handleArchive} disabled={actionLoading} title="Archivar" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"><svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg></button>
            <button onClick={() => setConfirmDelete(true)} disabled={actionLoading} title="Eliminar" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"><svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>}
          <div id="comments-section"><CommentExperience workId={work.id} initialCount={work.comments_count} open={commentsOpen} onOpen={openComments} /></div>
          {(prevHref || nextHref) && <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">{prevHref ? <Link href={prevHref} className="inline-flex items-center gap-2 text-action text-gray-500 transition-colors hover:text-gray-800"><span className="text-black/45">←</span><span>Anterior</span></Link> : <span />}{nextHref ? <Link href={nextHref} className="inline-flex items-center gap-2 text-action text-gray-500 transition-colors hover:text-gray-800"><span>Siguiente</span><span className="text-black/45">→</span></Link> : <span />}</div>}
        </div>
      </div>
      <ProjectAuthor author={{ username: author.username, fullName: author.full_name, avatarUrl: author.avatar_url, bio: author.bio, school: author.school }} profileHref={profileHref} />
    </div>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-canvas/95 p-3 backdrop-blur md:hidden"><ProjectActions workId={work.id} sharePath={sharePath} metrics={metrics} variant="mobile" onOpenComments={openComments} /></div>
    {confirmDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"><h3 className="text-section text-gray-900">¿Eliminar este proyecto?</h3><p className="mt-2 text-body-sm text-gray-500">Se eliminarán también todos sus likes y comentarios. Esta acción no se puede deshacer.</p><div className="mt-4 flex justify-end gap-2"><button onClick={() => setConfirmDelete(false)} className="rounded-lg px-4 py-2 text-action text-gray-600 transition-colors hover:bg-gray-100">Cancelar</button><button onClick={handleDelete} disabled={actionLoading} className="rounded-lg bg-red-600 px-4 py-2 text-action text-white transition-colors hover:bg-red-700 disabled:opacity-50">Eliminar</button></div></div></div>}
  </div>
}
