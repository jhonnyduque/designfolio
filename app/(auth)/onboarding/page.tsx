// app/(auth)/onboarding/page.tsx
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { OnboardingForm } from "@/components/onboarding/OnboardingForm"

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  // Not logged in → login
  if (!session?.user) redirect("/login")

  // Check if already completed onboarding
  const [profile] = await getDb().select({ onboardingCompleted: profiles.onboardingCompleted, fullName: profiles.fullName }).from(profiles).where(eq(profiles.id, session.user.id)).limit(1)

  // Already completed → dashboard
  if (profile?.onboardingCompleted) {
    redirect("/dashboard")
  }

  return (
    <AuthLayout>
      <OnboardingForm currentName={profile?.fullName ?? "New User"} />
    </AuthLayout>
  )
}
