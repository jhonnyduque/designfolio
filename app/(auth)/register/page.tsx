// app/(auth)/register/page.tsx
import { AuthLayout } from "@/components/auth/AuthLayout"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { googleSignInEnabled } from "@/lib/auth"

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm googleEnabled={googleSignInEnabled} />
    </AuthLayout>
  )
}
