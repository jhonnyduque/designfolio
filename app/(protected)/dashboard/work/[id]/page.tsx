// app/(protected)/dashboard/work/[id]/page.tsx
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDashboardWork } from "@/lib/works/dashboard"
import { toLegacyWorkDetailData } from "@/lib/works/detail-adapter"
import { WorkDetail } from "@/components/works/WorkDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  const result = await getDashboardWork(id, session.user.id)
  if (!result) notFound()
  const detailData = toLegacyWorkDetailData(result)

  return (
    <WorkDetail
      {...detailData}
      currentUserId={session.user.id}
      prevHref={result.navigation.previous ? `/dashboard/work/${result.navigation.previous.id}` : null}
      nextHref={result.navigation.next ? `/dashboard/work/${result.navigation.next.id}` : null}
    />
  )
}
