// app/(protected)/dashboard/moderation/tags/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TagsModerationPanel } from "@/components/moderation/TagsModerationPanel"

export const metadata = {
  title: "Moderación de Tags — Designfolio",
}

export default async function TagsModerationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Verify founder
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_founder")
    .eq("id", user.id)
    .single()

  if (!profile?.is_founder) redirect("/dashboard")

  return (
    <div className="py-8 px-4">
      <TagsModerationPanel />
    </div>
  )
}
