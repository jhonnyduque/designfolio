// app/(protected)/dashboard/my-works/page.tsx
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { MyWorks } from "@/components/works/MyWorks"

export default async function MyWorksPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: works } = await supabase
    .from("works")
    .select(
      "id, title, category, images, moderation_status, archived, likes_count, comments_count, created_at, published_at"
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  return <MyWorks works={works ?? []} />
}
