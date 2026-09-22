// components/profile/UserProfile.tsx
"use client"

import Link from "next/link"
import { coverUrl, soloVideo } from "@/lib/works/cover"
import { LikeButton } from "@/components/works/LikeButton"

interface WorkItem {
  id: string
  title: string
  category: string
  images: { url: string; type?: string }[]
  likes_count: number
  comments_count: number
  published_at: string
}

interface UserProfileProps {
  profile: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
    bio: string | null
    school: string | null
    career_year: string | null
    categories: string[] | null
    reputation_level: number
    total_points?: number | null
    created_at: string
  }
  works: WorkItem[]
}

const LEVEL_LABELS = ["Novato", "Activo", "Reconocido", "Referencia"]
const LEVEL_STYLES = [
  "bg-gray-100 text-gray-600",
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
]

export function UserProfile({ profile, works }: UserProfileProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-action text-gray-500 transition-colors hover:text-gray-700">
        ← Volver al feed
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
              <span className="text-page-title text-gray-500">{profile.full_name.charAt(0)}</span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-page-title text-gray-900">@{profile.username}</h1>
            <p className="mt-0.5 text-body-sm text-gray-500">{profile.full_name}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-meta font-medium ${LEVEL_STYLES[profile.reputation_level] ?? LEVEL_STYLES[0]}`}>
                {LEVEL_LABELS[profile.reputation_level] ?? "Novato"}
                {typeof profile.total_points === "number" && ` · ${profile.total_points} pts`}
              </span>
            </div>

            {profile.bio && <p className="mt-4 max-w-lg text-body-sm text-gray-600">{profile.bio}</p>}

            <div className="mt-3 flex flex-wrap gap-4 text-meta text-gray-400">
              <span>Miembro desde {joinDate}</span>
              <span>{works.length} {works.length === 1 ? "obra" : "obras"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-section text-gray-900">Obras</h2>

        {works.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
            <p className="text-body-sm text-gray-400">Este usuario aún no ha publicado obras.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => {
            const thumb = coverUrl(work.images)
            const esVideo = soloVideo(work.images)
            return (
              <Link key={work.id} href={`/dashboard/work/${work.id}`} className="block">
                <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {thumb ? (
                      <img src={thumb} alt={work.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
                    ) : esVideo ? (
                      <div className="flex h-full w-full items-center justify-center bg-gray-900">
                        <span className="text-meta uppercase tracking-wider text-gray-400">Video</span>
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-meta text-gray-300">Sin portada</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-subsection text-gray-900">{work.title}</h3>
                    <div className="mt-3 flex items-center gap-3 text-meta text-gray-400">
                      <LikeButton workId={work.id} initialCount={work.likes_count} size="sm" />
                      <span>{work.comments_count} comentarios</span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
