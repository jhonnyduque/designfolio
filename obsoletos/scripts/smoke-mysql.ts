import { eq } from "drizzle-orm"
import { getDb, getPool } from "../lib/db/client"
import { notifications, profiles, works } from "../lib/db/schema"

const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3000"
const db = getDb()
const authorId = crypto.randomUUID()
const workId = crypto.randomUUID()
const slug = `smoke-${workId}`
const expectStatus = (actual: number, expected: number, label: string) => {
  if (actual !== expected) throw new Error(`${label}: HTTP ${actual}; esperado ${expected}`)
}

async function main() {
try {
  await db.insert(profiles).values({ id: authorId, username: `smoke-${authorId.slice(0, 8)}`, fullName: "Prueba local" })
  await db.insert(works).values({
    id: workId, slug, authorId, title: "Proyecto de prueba local", description: "Proyecto temporal para verificar la integración del feed.",
    category: "Branding", images: [], moderationStatus: "approved", publishedAt: new Date(),
  })

  const feed = await fetch(`${base}/api/feed?q=Proyecto%20de%20prueba%20local`)
  expectStatus(feed.status, 200, "Feed")
  const feedData = await feed.json()
  if (!feedData.items?.some((item: { id: string }) => item.id === workId)) throw new Error("El feed no incluye el proyecto temporal")

  const detail = await fetch(`${base}/proyectos/${slug}`)
  expectStatus(detail.status, 200, "Detalle público")
  if (!(await detail.text()).includes("Proyecto de prueba local")) throw new Error("El detalle público no contiene el proyecto temporal")

  const url = `${base}/api/works/${workId}`
  const initial = await fetch(`${url}/likes`)
  expectStatus(initial.status, 200, "Leer like")
  const cookie = initial.headers.get("set-cookie")?.split(";")[0]
  if (!cookie) throw new Error("No se emitió cookie de visitante")
  const headers = { cookie }
  const like = await fetch(`${url}/likes`, { method: "POST", headers })
  expectStatus(like.status, 200, "Dar like")
  if (!(await like.json()).liked) throw new Error("El like no quedó activo")
  const commentHeaders = { ...headers, "content-type": "application/json" }
  const comment = await fetch(`${url}/comments`, {
    method: "POST", headers: commentHeaders,
    body: JSON.stringify({ content: "Comentario de integración local válido.", categories: ["Concepto"] }),
  })
  expectStatus(comment.status, 201, "Publicar comentario")
  const repeated = await fetch(`${url}/comments`, {
    method: "POST", headers: commentHeaders,
    body: JSON.stringify({ content: "Segundo comentario antes del límite permitido.", categories: ["Concepto"] }),
  })
  expectStatus(repeated.status, 429, "Límite de comentarios")
  const listed = await fetch(`${url}/comments`)
  expectStatus(listed.status, 200, "Leer comentarios")
  if ((await listed.json()).comments?.length !== 1) throw new Error("El comentario no fue recuperado")
  console.log("OK: feed, detalle, like, comentario y límite de repetición")
} finally {
  await db.delete(notifications).where(eq(notifications.targetId, workId))
  await db.delete(works).where(eq(works.id, workId))
  await db.delete(profiles).where(eq(profiles.id, authorId))
  await getPool().end()
}
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
