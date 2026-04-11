// components/works/WorkDetail.tsx
"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LikeButton } from "./LikeButton"
import { ShareButton } from "./ShareButton"
import { CommentsSection } from "./CommentsSection"

interface WorkImage {
  url: string
  width: number
  height: number
  type: string
  order: number
}

interface WorkDetailProps {
  work: {
    id: string
    slug?: string | null
    title: string
    description: string
    category: string
    tags: string[] | null
    images: WorkImage[]
    likes_count: number
    comments_count: number
    views_count: number
    published_at: string
  }
  author: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
    reputation_level: number
    bio: string | null
    school: string | null
  }
  currentUserId?: string | null
  backHref?: string
  profileHref?: string | null
  prevHref?: string | null
  nextHref?: string | null
}

const LEVEL_LABELS = ["Novato", "Activo", "Reconocido", "Referencia"]
const LEVEL_STYLES = [
  "bg-gray-100 text-gray-600",
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
]

export function WorkDetail({
  work,
  author,
  currentUserId,
  backHref = "/dashboard",
  profileHref = `/dashboard/profile/${author.username}`,
  prevHref = null,
  nextHref = null,
}: WorkDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(work.title)
  const [editDescription, setEditDescription] = useState(work.description)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(work.title)
  const [description, setDescription] = useState(work.description)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const isOwner = currentUserId === author.id
  const currentImage = work.images[selectedImage]
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hasMultipleImages = work.images.length > 1

  const publishedDate = new Date(work.published_at).toLocaleDateString(
    "es-ES",
    { day: "numeric", month: "long", year: "numeric" }
  )

  const handleSaveEdit = useCallback(async () => {
    if (!editTitle.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from("works")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim(),
        })
        .eq("id", work.id)

      if (error) throw error
      setTitle(editTitle.trim())
      setDescription(editDescription.trim())
      setEditing(false)
    } catch {
      // Silently fail
    } finally {
      setSaving(false)
    }
  }, [supabase, work.id, editTitle, editDescription])

  const handleArchive = useCallback(async () => {
    setActionLoading(true)
    try {
      const { error } = await supabase.rpc("user_archive_work", {
        p_work_id: work.id,
        p_archived: true,
      })
      if (error) throw error
      router.push("/dashboard/my-works")
    } catch {
      // Silently fail
    } finally {
      setActionLoading(false)
    }
  }, [supabase, work.id, router])

  const handleDelete = useCallback(async () => {
    setActionLoading(true)
    try {
      const { error } = await supabase.rpc("user_delete_work", {
        p_work_id: work.id,
      })
      if (error) throw error
      router.push("/dashboard/my-works")
    } catch {
      // Silently fail
    } finally {
      setActionLoading(false)
      setConfirmDelete(false)
    }
  }, [supabase, work.id, router])

  const goPrevImage = useCallback(() => {
    if (!hasMultipleImages) return
    setSelectedImage((prev) => (prev === 0 ? work.images.length - 1 : prev - 1))
  }, [hasMultipleImages, work.images.length])

  const goNextImage = useCallback(() => {
    if (!hasMultipleImages) return
    setSelectedImage((prev) => (prev === work.images.length - 1 ? 0 : prev + 1))
  }, [hasMultipleImages, work.images.length])

  const openVideoFullscreen = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    if (!hasMultipleImages) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrevImage()
      if (e.key === "ArrowRight") goNextImage()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [hasMultipleImages, goPrevImage, goNextImage])

  useEffect(() => {
    if (!lightboxOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightboxOpen])

  return (
    <div className="mx-auto max-w-[1180px] pb-20 md:pb-0">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        ← Volver al feed
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        {/* Left: Images + Description */}
        <div>
          {/* Main image */}
          {currentImage && (
            <div className="group relative bg-gray-100 rounded-xl overflow-hidden">
              {currentImage.type?.startsWith("video/") ? (
                <>
                  <video
                    ref={videoRef}
                    src={currentImage.url}
                    className="w-full h-auto max-h-[820px] object-contain mx-auto transition-opacity duration-300 bg-black"
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <button
                    type="button"
                    onClick={openVideoFullscreen}
                    className="absolute bottom-3 right-3 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur hover:bg-white"
                  >
                    Pantalla completa
                  </button>
                </>
              ) : (
                <img
                  src={currentImage.url}
                  alt={title}
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-auto max-h-[820px] cursor-zoom-in object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={goPrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-black/10 bg-white/70 text-black/45 opacity-0 transition-all hover:bg-white hover:text-black/70 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Imagen anterior"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-black/10 bg-white/70 text-black/45 opacity-0 transition-all hover:bg-white hover:text-black/70 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Siguiente imagen"
                  >
                    →
                  </button>
                </>
              )}
            </div>
          )}

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {work.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === selectedImage
                      ? "border-gray-900"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${i + 1}`}
                    className={`w-full h-full ${img.type?.startsWith("video/") ? "hidden" : "object-cover"}`}
                  />
                  {img.type?.startsWith("video/") && (
                    <video
                      src={img.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            {editing ? (
              /* Edit mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving || !editTitle.trim()}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditTitle(title)
                      setEditDescription(description)
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

                <div className="mt-2 flex items-center gap-3 text-sm text-gray-400">
                  <span className="uppercase text-xs font-semibold tracking-wider">
                    {work.category}
                  </span>
                  <span>·</span>
                  <span>{publishedDate}</span>
                </div>

                <p className="mt-5 text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </>
            )}

            {/* Tags */}
            {work.tags && work.tags.length > 0 && !editing && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats bar */}
            <div className="mt-6 hidden items-center gap-5 border-t border-gray-100 pt-6 md:flex">
              <LikeButton
                workId={work.id}
                initialCount={work.likes_count}
                size="md"
              />
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                {work.comments_count}{" "}
                {work.comments_count === 1 ? "comentario" : "comentarios"}
              </span>
              {work.views_count > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {work.views_count} vistas
                </span>
              )}
              <ShareButton
                workId={work.id}
                pathOverride={`/proyectos/${work.slug ?? work.id}`}
                size="md"
              />
            </div>

            {/* Owner actions */}
            {isOwner && !editing && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1">
                {/* Edit */}
                <button
                  onClick={() => setEditing(true)}
                  title="Editar"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                {/* Archive */}
                <button
                  onClick={handleArchive}
                  disabled={actionLoading}
                  title="Archivar"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={actionLoading}
                  title="Eliminar"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Comments */}
            <div id="comments-section">
              <CommentsSection
                workId={work.id}
                initialCount={work.comments_count}
              />
            </div>

            {(prevHref || nextHref) && (
              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
                {prevHref ? (
                  <Link
                    href={prevHref}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
                  >
                    <span className="text-black/45">←</span>
                    <span>Anterior</span>
                  </Link>
                ) : (
                  <span />
                )}
                {nextHref ? (
                  <Link
                    href={nextHref}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
                  >
                    <span>Siguiente</span>
                    <span className="text-black/45">→</span>
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Author sidebar */}
        <aside className="lg:pt-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:sticky lg:top-20">
            <div className="flex items-center gap-3">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-500">
                    {author.full_name?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {author.full_name}
                </p>
                <p className="text-sm text-gray-500">@{author.username}</p>
              </div>
            </div>

            <span
              className={`inline-block mt-3 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                LEVEL_STYLES[author.reputation_level] ?? LEVEL_STYLES[0]
              }`}
            >
              {LEVEL_LABELS[author.reputation_level] ?? LEVEL_LABELS[0]}
            </span>

            {author.bio && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {author.bio}
              </p>
            )}

            {author.school && (
              <p className="mt-2 text-sm text-gray-400">
                🎓 {author.school}
              </p>
            )}

            {profileHref && (
              <Link
                href={profileHref}
                className="block mt-4 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Ver perfil completo →
              </Link>
            )}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#f5f7f5]/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-black/10 bg-white px-4 py-2">
          <LikeButton
            workId={work.id}
            initialCount={work.likes_count}
            size="sm"
          />
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("comments-section")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="inline-flex items-center gap-1.5 text-xs text-gray-500"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span>{work.comments_count}</span>
          </button>
          <ShareButton
            workId={work.id}
            pathOverride={`/proyectos/${work.slug ?? work.id}`}
            size="sm"
          />
        </div>
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900">
              ¿Eliminar este proyecto?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Se eliminarán también todos sus likes y comentarios. Esta acción no
              se puede deshacer.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && currentImage && !currentImage.type?.startsWith("video/") && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 p-4 md:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-[71] rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-900"
          >
            Cerrar
          </button>
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={currentImage.url}
              alt={title}
              className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
