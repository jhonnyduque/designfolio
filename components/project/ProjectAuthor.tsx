import Link from "next/link"

type Props = {
  author: {
    username: string
    fullName: string
    avatarUrl: string | null
    bio: string | null
    school: string | null
  }
  profileHref?: string | null
}

/** Identidad pública del autor. No contiene permisos ni acciones de propietario. */
export function ProjectAuthor({ author, profileHref }: Props) {
  return (
    <aside className="lg:pt-0">
      <div className="lg:sticky lg:top-20">
        <div className="flex items-center gap-3">
          {author.avatarUrl ? (
            <img src={author.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <span className="text-section text-gray-500">{author.fullName?.charAt(0) ?? "?"}</span>
            </div>
          )}
          <div>
            <p className="text-subsection text-gray-900">{author.fullName}</p>
            <p className="text-meta text-gray-500">@{author.username}</p>
          </div>
        </div>

        {author.bio && <p className="mt-3 text-body-sm text-gray-600">{author.bio}</p>}
        {author.school && (
          <p className="mt-2 flex items-center gap-1.5 text-meta text-gray-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 17h16M7 17l1.5-6h7L17 17M10 11l1-4h2l1 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {author.school}
          </p>
        )}
        {profileHref && (
          <Link href={profileHref} className="mt-4 block text-center text-action text-gray-500 transition-colors hover:text-gray-700">
            Ver perfil completo →
          </Link>
        )}
      </div>
    </aside>
  )
}
