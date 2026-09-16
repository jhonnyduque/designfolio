import { eq, ne } from "drizzle-orm"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { PROFILE_LIMITS } from "@/types/profile"

export const runtime = "nodejs"

const avatarExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
])

async function currentUser(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers })
}

export async function GET(request: NextRequest) {
  const session = await currentUser(request)
  if (!session?.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 })
  const [profile] = await getDb().select().from(profiles).where(eq(profiles.id, session.user.id)).limit(1)
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 })
  return NextResponse.json({ profile })
}

export async function PATCH(request: NextRequest) {
  const session = await currentUser(request)
  if (!session?.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 })
  const body = await request.json() as Record<string, unknown>
  const username = typeof body.username === "string" ? body.username.toLowerCase().replace(/[^a-z0-9_]/g, "") : ""
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""
  const bio = typeof body.bio === "string" ? body.bio.trim() : ""
  const school = typeof body.school === "string" ? body.school.trim() : ""
  const careerYear = typeof body.careerYear === "string" ? body.careerYear : ""
  const categories = Array.isArray(body.categories) ? body.categories.filter((value): value is string => typeof value === "string") : []
  const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl : null

  if (username.length < PROFILE_LIMITS.USERNAME_MIN || username.length > PROFILE_LIMITS.USERNAME_MAX) return NextResponse.json({ error: `El usuario debe tener entre ${PROFILE_LIMITS.USERNAME_MIN} y ${PROFILE_LIMITS.USERNAME_MAX} caracteres.` }, { status: 400 })
  if (fullName.length < 2 || fullName.length > 150) return NextResponse.json({ error: "Indica un nombre completo válido." }, { status: 400 })
  if (bio.length < PROFILE_LIMITS.BIO_MIN || bio.length > PROFILE_LIMITS.BIO_MAX) return NextResponse.json({ error: `La bio debe tener entre ${PROFILE_LIMITS.BIO_MIN} y ${PROFILE_LIMITS.BIO_MAX} caracteres.` }, { status: 400 })
  if (school.length > 150) return NextResponse.json({ error: "El nombre de la escuela no puede superar 150 caracteres." }, { status: 400 })
  if (categories.length < PROFILE_LIMITS.CATEGORIES_MIN || categories.length > PROFILE_LIMITS.CATEGORIES_MAX) return NextResponse.json({ error: `Selecciona entre ${PROFILE_LIMITS.CATEGORIES_MIN} y ${PROFILE_LIMITS.CATEGORIES_MAX} categorías.` }, { status: 400 })
  if (avatarUrl && !avatarUrl.startsWith(`/uploads/${session.user.id}/avatar/`)) return NextResponse.json({ error: "El avatar no pertenece a tu cuenta." }, { status: 400 })

  const [taken] = await getDb().select({ id: profiles.id }).from(profiles).where(eq(profiles.username, username)).limit(1)
  if (taken && taken.id !== session.user.id) return NextResponse.json({ error: "Ese nombre de usuario ya está en uso." }, { status: 409 })

  await getDb().update(profiles).set({
    username,
    fullName,
    avatarUrl,
    bio,
    school: school || null,
    careerYear: careerYear || null,
    categories,
    onboardingCompleted: true,
    updatedAt: new Date(),
  }).where(eq(profiles.id, session.user.id))
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "La carga local de avatar está desactivada en producción hasta configurar almacenamiento persistente." }, { status: 503 })
  const session = await currentUser(request)
  if (!session?.user) return NextResponse.json({ error: "Sesión requerida." }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get("avatar")
  if (!(file instanceof File) || !avatarExtensions.has(file.type)) return NextResponse.json({ error: "Usa una imagen JPG, PNG o WebP para el avatar." }, { status: 400 })
  if (file.size === 0 || file.size > PROFILE_LIMITS.AVATAR_MAX_SIZE_BYTES) return NextResponse.json({ error: `El avatar debe pesar como máximo ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB.` }, { status: 400 })
  const directory = path.join(process.cwd(), "public", "uploads", session.user.id, "avatar")
  const filename = `${crypto.randomUUID()}.${avatarExtensions.get(file.type)}`
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()))
  return NextResponse.json({ url: `/uploads/${session.user.id}/avatar/${filename}` })
}
