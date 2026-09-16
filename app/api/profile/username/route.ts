import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return NextResponse.json({ available: false }, { status: 401 })
  const username = (request.nextUrl.searchParams.get("value") ?? "").toLowerCase().replace(/[^a-z0-9_]/g, "")
  if (username.length < 3 || username.length > 30) return NextResponse.json({ available: false })
  const [existing] = await getDb().select({ id: profiles.id }).from(profiles).where(eq(profiles.username, username)).limit(1)
  return NextResponse.json({ available: !existing || existing.id === session.user.id })
}
