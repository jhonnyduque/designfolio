import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { profiles, works } from "@/lib/db/schema"
import { getActiveCategoryNames } from "@/lib/server/actions/taxonomy"
import { normalizeSlug } from "@/lib/slug"
import { WORK_LIMITS, type WorkImage } from "@/types/work"

export const runtime = "nodejs"

type CreateWorkBody = {
  id?: unknown
  slug?: unknown
  title?: unknown
  description?: unknown
  category?: unknown
  tags?: unknown
  images?: unknown
}

function isWorkImage(value: unknown): value is WorkImage {
  if (!value || typeof value !== "object") return false
  const image = value as WorkImage
  return (
    typeof image.url === "string" &&
    typeof image.width === "number" &&
    Number.isFinite(image.width) &&
    typeof image.height === "number" &&
    Number.isFinite(image.height) &&
    typeof image.type === "string" &&
    typeof image.order === "number" &&
    Number.isInteger(image.order)
  )
}

function invalid(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Tu sesión expiró. Inicia sesión de nuevo para publicar." }, { status: 401 })
  }

  let body: CreateWorkBody
  try {
    body = await request.json()
  } catch {
    return invalid("No se pudo leer la información del proyecto. Recarga la página e inténtalo de nuevo.")
  }

  const id = typeof body.id === "string" ? body.id : ""
  const title = typeof body.title === "string" ? body.title.trim() : ""
  const description = typeof body.description === "string" ? body.description.trim() : ""
  const category = typeof body.category === "string" ? body.category : ""
  const slug = normalizeSlug(typeof body.slug === "string" ? body.slug : "")
  const tags = Array.isArray(body.tags) ? body.tags : []
  const images = Array.isArray(body.images) ? body.images : []

  if (!/^[0-9a-f-]{36}$/i.test(id)) return invalid("El identificador temporal del proyecto no es válido. Vuelve a cargar los medios.")
  if (title.length < WORK_LIMITS.TITLE_MIN || title.length > WORK_LIMITS.TITLE_MAX) return invalid(`El título debe tener entre ${WORK_LIMITS.TITLE_MIN} y ${WORK_LIMITS.TITLE_MAX} caracteres.`)
  if (description.length < WORK_LIMITS.DESCRIPTION_MIN) return invalid(`La descripción debe tener al menos ${WORK_LIMITS.DESCRIPTION_MIN} caracteres.`)
  if (description.length > 10000) return invalid("La descripción supera el límite de 10.000 caracteres.")
  if (!slug || slug.length > 180) return invalid("El slug debe contener entre 1 y 180 caracteres válidos.")
  // La lista viene de `taxonomy`, no de una constante: así lo que ofrece el
  // formulario y lo que acepta la API son siempre lo mismo, y una categoría
  // nueva del panel queda disponible sin tocar código.
  const allowedCategories = await getActiveCategoryNames()
  if (!allowedCategories.includes(category)) return invalid("Selecciona una categoría válida.")
  if (tags.length > WORK_LIMITS.TAGS_MAX || tags.some((tag) => typeof tag !== "string" || tag.length > 80)) return invalid(`Puedes añadir hasta ${WORK_LIMITS.TAGS_MAX} etiquetas válidas.`)
  if (images.length < WORK_LIMITS.IMAGES_MIN || images.length > WORK_LIMITS.IMAGES_MAX || !images.every(isWorkImage)) return invalid(`Debes incluir entre ${WORK_LIMITS.IMAGES_MIN} y ${WORK_LIMITS.IMAGES_MAX} medios válidos.`)

  const uploadPrefix = `/uploads/${session.user.id}/${id}/`
  if (process.env.NODE_ENV !== "production" && images.some((image, index) => image.url.indexOf(uploadPrefix) !== 0 || image.order !== index || image.width < 1 || image.height < 1)) {
    return invalid("Uno o más medios no pertenecen a esta publicación. Vuelve a subirlos antes de publicar.")
  }

  const db = getDb()
  const [profile] = await db
    .select({ isFounder: profiles.isFounder, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)
  if (!profile?.isActive) return NextResponse.json({ error: "Tu cuenta no está activa para publicar. Contacta al administrador." }, { status: 403 })

  const [existing] = await db.select({ id: works.id }).from(works).where(eq(works.slug, slug)).limit(1)
  if (existing) return NextResponse.json({ error: `El slug \"${slug}\" ya está en uso. Elige otro para crear una URL única.` }, { status: 409 })

  const moderationStatus = profile.isFounder ? "approved" : "pending_review"
  try {
    await db.insert(works).values({
      id,
      slug,
      authorId: session.user.id,
      title,
      description,
      category,
      tags: tags as string[],
      images,
      moderationStatus,
      publishedAt: moderationStatus === "approved" ? new Date() : null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("works_slug_key") || message.includes("Duplicate entry")) {
      return NextResponse.json({ error: `El slug \"${slug}\" acaba de ser usado por otra publicación. Elige otro.` }, { status: 409 })
    }
    throw error
  }

  return NextResponse.json({ id, slug, moderationStatus }, { status: 201 })
}
