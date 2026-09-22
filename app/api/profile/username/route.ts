import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { normalizeUsername, usernameValidationError } from "@/lib/username"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ available: false }, { status: 401 })
  }

  const username = normalizeUsername(request.nextUrl.searchParams.get("value") ?? "")
  const validationError = usernameValidationError(username)
  if (validationError) {
    return NextResponse.json({ available: false, error: validationError })
  }

  const [existing] = await getDb()
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)

  return NextResponse.json({
    available: !existing || existing.id === session.user.id,
  })
}
