import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getPublicWork } from "@/lib/works/public"
import { WorkDetail } from "@/components/works/WorkDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Una obra, vista desde fuera.
 *
 * Esta pantalla tenía su propia cabecera, con otro logotipo y sin menú: era la
 * herencia de cuando se servía como una pieza suelta enlazada desde
 * jhonnyduque.com. Ahora entra en el mismo armazón público que el resto, así
 * que quien llega aquí tiene la misma navegación que en el feed.
 *
 * El enlace de vuelta al sitio del autor no se ha perdido: viaja como
 * `siteHref` y sale en la misma línea que el enlace de volver al feed, dentro
 * del contenido, sin montar una segunda cabecera.
 */
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
    <div className="public-container py-6 md:py-8">
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
        backHref="/"
        profileHref={null}
        siteHref="https://jhonnyduque.com/proyectos/"
        prevHref={previous ? `/proyectos/${previous.slug ?? previous.id}` : null}
        nextHref={next ? `/proyectos/${next.slug ?? next.id}` : null}
      />
    </div>
  )
}
