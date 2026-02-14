// components/works/MyWorks.tsx
"use client"

import Link from "next/link"

interface MyWork {
  id: string
  title: string
  category: string
  images: { url: string }[]
  moderation_status: string
  likes_count: number
  comments_count: number
  created_at: string
  published_at: string | null
}

const STATUS_STYLES: Record<string, { label: string; style: string }> = {
  draft: { label: "Borrador", style: "bg-gray-100 text-gray-600" },
  pending_review: {
    label: "En revisión",
    style: "bg-amber-50 text-amber-700",
  },
  approved: { label: "Publicada", style: "bg-green-50 text-green-700" },
  rejected: { label: "Rechazada", style: "bg-red-50 text-red-600" },
}

export function MyWorks({ works }: { works: MyWork[] }) {
  const pending = works.filter((w) => w.moderation_status === "pending_review")
  const approved = works.filter((w) => w.moderation_status === "approved")
  const rejected = works.filter((w) => w.moderation_status === "rejected")

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis obras</h1>
          <p className="mt-1 text-sm text-gray-500">
            {works.length} {works.length === 1 ? "obra" : "obras"} en total
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nueva Obra
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-green-600">{approved.length}</p>
          <p className="text-xs text-gray-500">Publicadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{pending.length}</p>
          <p className="text-xs text-gray-500">En revisión</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-red-500">{rejected.length}</p>
          <p className="text-xs text-gray-500">Rechazadas</p>
        </div>
      </div>

      {works.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">
            No has publicado ninguna obra aún.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Crear tu primera obra
          </Link>
        </div>
      )}

      {/* Works grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {works.map((work) => {
          const thumb = work.images?.[0]?.url ?? null
          const status = STATUS_STYLES[work.moderation_status] ?? STATUS_STYLES.draft
          const isApproved = work.moderation_status === "approved"
          const date = new Date(work.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })

          const Wrapper = isApproved ? Link : "div"
          const wrapperProps = isApproved
            ? { href: `/dashboard/work/${work.id}`, className: "block" }
            : { className: "block" }

          return (
            <Wrapper key={work.id} {...(wrapperProps as any)}>
              <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={work.title}
                      className={`w-full h-full object-cover ${
                        isApproved
                          ? "group-hover:scale-[1.02] transition-transform duration-300"
                          : "opacity-75"
                      }`}
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

                  {/* Status badge */}
                  <span
                    className={`absolute top-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-full ${status.style}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {work.category}
                  </span>
                  <h3 className="mt-1 text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2">
                    {work.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{date}</span>
                    {isApproved && (
                      <span className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          ♥ {work.likes_count}
                        </span>
                        <span className="flex items-center gap-0.5">
                          💬 {work.comments_count}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Wrapper>
          )
        })}
      </div>
    </div>
  )
}
