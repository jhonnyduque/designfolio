import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/client"
import { works } from "@/lib/db/schema"
import { normalizeSlug } from "@/lib/slug"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const slug = normalizeSlug(request.nextUrl.searchParams.get("value") ?? "")
  if (!slug || slug.length > 180) return NextResponse.json({ available: false, error: "El slug debe contener entre 1 y 180 caracteres válidos." }, { status: 400 })
  const [existing] = await getDb().select({ id: works.id }).from(works).where(eq(works.slug, slug)).limit(1)
  return NextResponse.json({ available: !existing, slug })
}
