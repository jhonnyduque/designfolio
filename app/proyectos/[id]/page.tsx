import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getPublicWork } from "@/lib/works/public"
import { WorkDetail } from "@/components/works/WorkDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicWorkPage({ params }: PageProps) {
  const { id: slugOrId } = await params
  const result = await getPublicWork(slugOrId)
  if (!result) notFound()
  const { work, author, likesCount, commentsCount, previous, next } = result

  if (work.slug && slugOrId !== work.slug) {
    redirect(`/proyectos/${work.slug}`)
  }

  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center justify-between px-6 md:px-10">
          <Link
            href="https://jhonnyduque.com"
            aria-label="Ir a jhonnyduque.com"
            className="inline-flex items-center"
          >
            <Image
              src="/brand/simbolo-logo.webp"
              alt="Jhonny Duque"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </Link>
          <Link
            href="https://jhonnyduque.com/proyectos/"
            target="_blank"
            rel="noreferrer"
            className="brand-pill inline-flex items-center px-4 py-1.5 text-xs font-semibold text-white hover:opacity-95"
          >
            Volver a jhonnyduque.com
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1500px] px-6 py-6 md:px-10 md:py-8">
        <WorkDetail
          work={{
            id: work.id,
            slug: work.slug ?? null,
            title: work.title,
            description: work.description,
            category: work.category,
            tags: work.tags ?? [],
            images: work.images,
            likes_count: likesCount,
            comments_count: commentsCount,
            views_count: work.viewsCount,
            published_at: (work.publishedAt ?? work.createdAt).toISOString(),
          }}
          author={{
            id: author.id,
            username: author.username,
            full_name: author.fullName,
            avatar_url: author.avatarUrl,
            reputation_level: author.reputationLevel,
            bio: author.bio,
            school: author.school,
          }}
          currentUserId={session?.user.id ?? null}
          backHref="/proyectos"
          profileHref={null}
          prevHref={previous ? `/proyectos/${previous.slug ?? previous.id}` : null}
          nextHref={next ? `/proyectos/${next.slug ?? next.id}` : null}
        />
      </section>
    </main>
  )
}
