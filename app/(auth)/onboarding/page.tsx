// app/(auth)/onboarding/page.tsx
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { OnboardingForm } from "@/components/onboarding/OnboardingForm"

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in → login
  if (!user) redirect("/login")

  // Check if already completed onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, full_name")
    .eq("id", user.id)
    .single()

  // Already completed → dashboard
  if (profile?.onboarding_completed) {
    redirect("/dashboard")
  }

  return (
    <AuthLayout>
      <OnboardingForm currentName={profile?.full_name ?? "New User"} />
    </AuthLayout>
  )
}
