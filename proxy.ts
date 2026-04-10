// proxy.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  // Remove tracking params to keep clean, trust-building URLs.
  const trackingParams = [
    "_gl",
    "_ga",
    "_ga_4TXL2R7VB0",
    "gclid",
    "fbclid",
    "mc_cid",
    "mc_eid",
  ]
  const cleanedUrl = request.nextUrl.clone()
  let hasTracking = false

  trackingParams.forEach((key) => {
    if (cleanedUrl.searchParams.has(key)) {
      cleanedUrl.searchParams.delete(key)
      hasTracking = true
    }
  })
  Array.from(cleanedUrl.searchParams.keys()).forEach((key) => {
    if (key.toLowerCase().startsWith("utm_")) {
      cleanedUrl.searchParams.delete(key)
      hasTracking = true
    }
  })

  if (hasTracking) {
    return NextResponse.redirect(cleanedUrl)
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          response = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const previewAccess =
    request.nextUrl.searchParams.get("preview") === "true" ||
    request.cookies.get("preview_access")?.value === "true"

  if (request.nextUrl.searchParams.get("preview") === "true") {
    response.cookies.set("preview_access", "true", {
      path: "/",
      maxAge: 60,
    })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si NO está autenticado y quiere ir a dashboard
  if (
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !user &&
    !previewAccess
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Si ya está autenticado y va a login/register
  if (
    ["/login", "/register", "/forgot"].includes(request.nextUrl.pathname) &&
    user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/", "/proyectos/:path*", "/dashboard/:path*", "/login", "/register", "/forgot"],
}
