// app/(protected)/dashboard/my-works/page.tsx
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDashboardWorks } from "@/lib/works/dashboard"
import { MyWorks } from "@/components/works/MyWorks"

export default async function MyWorksPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")
  return <MyWorks works={await getDashboardWorks(session.user.id)} />
}
