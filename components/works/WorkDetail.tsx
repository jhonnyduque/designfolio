"use client"

import { useState } from "react"
import Link from "next/link"
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
}

const LEVEL_LABELS = ["Novato", "Activo", "Reconocido", "Referencia"]
const LEVEL_STYLES = [
  "bg-gray-100 text-gray-600",
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
]

export function WorkDetail({ work, author }: WorkDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const currentImage = work.images[selectedImage]

  const publishedDate = new Date(work.published_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

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
        
        {/* LEFT COLUMN */}
        <div>
          {/* Main Image */}
          {currentImage && (
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={currentImage.url}
                alt={work.title}
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
                    alt={`thumbnail-${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {work.title}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-sm text-gray-400">
              <span className="uppercase text-xs font-semibold tracking-wider">
                {work.category}
              </span>
              <span>·</span>
              <span>{publishedDate}</span>
            </div>

            <p className="mt-5 text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap">
              {work.description}
            </p>

            {/* Tags */}
            {work.tags && work.tags.length > 0 && (
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

              <span className="text-sm text-gray-500">
                {work.comments_count}{" "}
                {work.comments_count === 1 ? "comentario" : "comentarios"}
              </span>

              {work.views_count > 0 && (
                <span className="text-sm text-gray-500">
                  {work.views_count} vistas
                </span>
              )}

              <ShareButton workId={work.id} size="md" />
            </div>

            {/* Comments */}
            <div className="mt-8">
              <CommentsSection
                workId={work.id}
                initialCount={work.comments_count}
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside>
          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:sticky lg:top-20">
            
            {/* Author */}
            <div className="flex items-center gap-3">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-500">
                    {author.full_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {author.full_name}
                </p>
                <p className="text-xs text-gray-400">
                  @{author.username}
                </p>
              </div>
            </div>

            {/* Reputation */}
            <div className="mt-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  LEVEL_STYLES[author.reputation_level] ?? LEVEL_STYLES[0]
                }`}
              >
                {LEVEL_LABELS[author.reputation_level] ?? "Novato"}
              </span>
            </div>

            {/* Bio */}
            {author.bio && (
              <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                {author.bio}
              </p>
            )}

            {/* School */}
            {author.school && (
              <p className="mt-2 text-xs text-gray-400">
                🎓 {author.school}
              </p>
            )}

            {/* Profile link */}
            <Link
              href={`/dashboard/profile/${author.username}`}
              className="mt-4 block text-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors pt-3 border-t border-gray-100"
            >
              Ver perfil completo →
            </Link>
          </div>
        </aside>

      </div>
    </div>
  )
}
