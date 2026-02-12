// app/auth/callback/route.ts

import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // 🔎 1️⃣ Validación temprana (Early return)
  if (!code) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    // 🔥 En Next 16 cookies() es async
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    // ✅ Login exitoso → redirige a dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))

  } catch (error) {
    console.error("Auth callback error:", error)

    // ❌ Si algo falla → vuelve al login
    return NextResponse.redirect(new URL("/?error=auth", request.url))
  }
}
