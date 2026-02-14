// components/profile/AuthorDashboard.tsx
"use client"

import Link from "next/link"

interface WorkStat {
  id: string
  title: string
  category: string
  images: { url: string }[]
  moderation_status: string
  likes_count: number
  comments_count: number
  views_count: number
  published_at: string | null
  created_at: string
}

interface AuthorDashboardProps {
  profile: {
    full_name: string
    username: string
    reputation_level: number
    reputation_points: number
  }
  works: WorkStat[]
}

const LEVEL_LABELS = ["Novato", "Activo", "Reconocido", "Referente"] as const

export function AuthorDashboard({ profile, works }: AuthorDashboardProps) {
  const approved = works.filter((w) => w.moderation_status === "approved")
  const pending = works.filter((w) => w.moderation_status === "pending_review")
  const rejected = works.filter((w) => w.moderation_status === "rejected")

  const totalLikes = approved.reduce((sum, w) => sum + w.likes_count, 0)
  const totalComments = approved.reduce((sum, w) => sum + w.comments_count, 0)
  const totalViews = approved.reduce((sum, w) => sum + w.views_count, 0)

  // Sort by engagement (likes + comments)
  const topWorks = [...approved]
    .sort(
      (a, b) =>
        b.likes_count + b.comments_count - (a.likes_count + a.comments_count)
    )
    .slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Resumen de tu actividad en Designfolio
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nueva Obra
        </Link>
      </div>

      {/* Profile summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">{profile.full_name}</p>
          <p className="text-sm text-gray-500">@{profile.username}</p>
        </div>
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            {LEVEL_LABELS[profile.reputation_level] ?? "Novato"}
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {profile.reputation_points} pts de reputación
          </p>
        </div>
      </div>

      {/* Big numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{approved.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Obras publicadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{totalLikes}</p>
          <p className="text-xs text-gray-500 mt-0.5">Likes recibidos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalComments}</p>
          <p className="text-xs text-gray-500 mt-0.5">Comentarios</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{totalViews}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vistas totales</p>
        </div>
      </div>

      {/* Status overview */}
      {(pending.length > 0 || rejected.length > 0) && (
        <div className="flex gap-3 mb-6">
          {pending.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-sm text-amber-700">
                {pending.length} en revisión
              </span>
            </div>
          )}
          {rejected.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-sm text-red-600">
                {rejected.length}{" "}
                {rejected.length === 1 ? "rechazada" : "rechazadas"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Top works */}
      {topWorks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Rendimiento por obra
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topWorks.map((work) => {
              const thumb = work.images?.[0]?.url ?? null
              return (
                <Link
                  key={work.id}
                  href={`/dashboard/work/${work.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-300 text-xs">—</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {work.title}
                    </p>
                    <p className="text-xs text-gray-400">{work.category}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <span className="text-red-400">♥</span>
                      {work.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">💬</span>
                      {work.comments_count}
                    </span>
                    <span className="flex items-center gap-1 hidden sm:flex">
                      <span className="text-gray-400">👁</span>
                      {work.views_count}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          {approved.length > 5 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <Link
                href="/dashboard/my-works"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Ver todas las obras →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {works.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">
            Aún no tienes obras publicadas.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Publica tu primera obra para ver tus estadísticas aquí.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Crear mi primera obra
          </Link>
        </div>
      )}
    </div>
  )
}
