import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const cleanedUrl = request.nextUrl.clone()
  let changed = false
  const trackingParams = new Set(["_gl", "_ga", "_ga_4TXL2R7VB0", "gclid", "fbclid", "mc_cid", "mc_eid"])
  for (const key of cleanedUrl.searchParams.keys()) {
    if (trackingParams.has(key) || key.toLowerCase().startsWith("utm_")) {
      cleanedUrl.searchParams.delete(key)
      changed = true
    }
  }
  return changed ? NextResponse.redirect(cleanedUrl) : NextResponse.next()
}

export const config = {
  matcher: ["/", "/proyectos/:path*", "/dashboard/:path*", "/login", "/register", "/forgot"],
}
