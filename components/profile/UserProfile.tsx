// components/profile/UserProfile.tsx
"use client"

import Link from "next/link"
import { LikeButton } from "@/components/works/LikeButton"

interface WorkItem {
  id: string
  title: string
  category: string
  images: { url: string }[]
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
    total_points: number
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
    <div className="max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        ← Volver al feed
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Avatar */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">
                {profile.full_name.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.full_name}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              @{profile.username}
            </p>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  LEVEL_STYLES[profile.reputation_level] ?? LEVEL_STYLES[0]
                }`}
              >
                {LEVEL_LABELS[profile.reputation_level] ?? "Novato"} ·{" "}
                {profile.total_points} pts
              </span>
              {profile.categories?.map((cat) => (
                <span
                  key={cat}
                  className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-lg">
                {profile.bio}
              </p>
            )}

            {/* Meta */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
              {profile.school && <span>🎓 {profile.school}</span>}
              {profile.career_year && <span>{profile.career_year}</span>}
              <span>Miembro desde {joinDate}</span>
              <span>{works.length} {works.length === 1 ? "obra" : "obras"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Works grid */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Obras</h2>

        {works.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm">
              Este usuario aún no ha publicado obras.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {works.map((work) => {
            const thumb = work.images?.[0]?.url ?? null
            return (
              <Link
                key={work.id}
                href={`/dashboard/work/${work.id}`}
                className="block"
              >
                <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {work.category}
                    </span>
                    <h3 className="mt-1 text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2">
                      {work.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                      <LikeButton
                        workId={work.id}
                        initialCount={work.likes_count}
                        size="sm"
                      />
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {work.comments_count}
                      </span>
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
