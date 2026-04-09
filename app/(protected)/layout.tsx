// app/(protected)/layout.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "./DashboardShell"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const previewAccess = cookies().get("preview_access")?.value === "true"

  if (!user) {
    if (!previewAccess) {
      redirect("/login")
    }

    return (
      <DashboardShell email="" isFounder={false}>
        {children}
      </DashboardShell>
    )
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
