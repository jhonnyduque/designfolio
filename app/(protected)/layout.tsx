// app/(protected)/layout.tsx
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardShell } from "./DashboardShell"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch profile for founder check + onboarding check
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_founder, onboarding_completed")
    .eq("id", user.id)
    .single()

  // Redirect to onboarding if not completed
  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  return (
    <DashboardShell
      email={user.email ?? ""}
      isFounder={profile?.is_founder ?? false}
    >
      {children}
    </DashboardShell>
  )
}
