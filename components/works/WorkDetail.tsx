// components/works/WorkDetail.tsx
"use client"

import { useState, useCallback } from "react"
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
}

const LEVEL_LABELS = ["Novato", "Activo", "Reconocido", "Referencia"]
const LEVEL_STYLES = [
  "bg-gray-100 text-gray-600",
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
]

export function WorkDetail({ work, author, currentUserId }: WorkDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        ← Volver al feed
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Left: Images + Description */}
        <div>
          {/* Main image */}
          {currentImage && (
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={currentImage.url}
                alt={title}
                className="w-full h-auto max-h-[600px] object-contain mx-auto"
              />
            </div>
          )}

          {/* Thumbnails */}
          {work.images.length > 1 && (
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
                    className="w-full h-full object-cover"
                  />
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
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-5">
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
              <ShareButton workId={work.id} size="md" />
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
            <CommentsSection
              workId={work.id}
              initialCount={work.comments_count}
            />
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

            <Link
              href={`/dashboard/profile/${author.username}`}
              className="block mt-4 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Ver perfil completo →
            </Link>
          </div>
        </aside>
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900">
              ¿Eliminar esta obra?
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
    </div>
  )
}