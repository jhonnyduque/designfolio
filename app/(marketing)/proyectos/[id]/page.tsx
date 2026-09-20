import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getPublicWork } from "@/lib/works/public"
import { toLegacyWorkDetailData } from "@/lib/works/detail-adapter"
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

  if (slugOrId !== result.project.slug) {
    redirect(`/proyectos/${result.project.slug}`)
  }

  const session = await auth.api.getSession({ headers: await headers() })
  const detailData = toLegacyWorkDetailData(result)

  return (
    <div className="public-container py-6 md:py-8">
      <WorkDetail
        {...detailData}
        currentUserId={session?.user.id ?? null}
        backHref="/"
        profileHref={null}
        siteHref="https://jhonnyduque.com/proyectos/"
        prevHref={result.navigation.previous ? `/proyectos/${result.navigation.previous.slug}` : null}
        nextHref={result.navigation.next ? `/proyectos/${result.navigation.next.slug}` : null}
        trackView
      />
    </div>
  )
}
