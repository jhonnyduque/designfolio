// app/(auth)/forgot/page.tsx
import { AuthLayout } from "@/components/auth/AuthLayout"
import { ForgotForm } from "@/components/auth/ForgotForm"

export default function ForgotPage() {
  return (
    <AuthLayout>
      <ForgotForm />
    </AuthLayout>
  )
}
