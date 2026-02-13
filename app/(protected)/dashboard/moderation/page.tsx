// app/(protected)/dashboard/moderation/page.tsx
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ModerationPanel } from "@/components/moderation/ModerationPanel"

export default async function ModerationPage() {
  // Server-side founder check
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Check if user is founder
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_founder")
    .eq("id", user.id)
    .single()

  if (!profile?.is_founder) {
    redirect("/dashboard")
  }

  return <ModerationPanel />
}
