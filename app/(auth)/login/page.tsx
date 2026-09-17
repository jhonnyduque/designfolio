// app/(auth)/login/page.tsx
import { AuthLayout } from "@/components/auth/AuthLayout"
import { LoginForm } from "@/components/auth/LoginForm"
import { googleSignInEnabled } from "@/lib/auth"

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm googleEnabled={googleSignInEnabled} />
    </AuthLayout>
  )
}
