// app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")

  if (code) {
    const response = NextResponse.redirect(`${origin}/dashboard`)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Note: For Google OAuth users, the invite code is stored in localStorage
      // on the client side. It will be claimed on the client after redirect
      // via the ClaimInviteCode component in the protected layout.
      return response
    }
  }

  // If error, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
