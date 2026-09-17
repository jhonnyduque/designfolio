/**
 * Datos de demostración: perfiles, publicaciones, likes, comentarios,
 * invitaciones y registro de moderación.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/seed-demo.ts
 *   npx tsx --env-file=.env.local scripts/seed-demo.ts --remove
 *
 * Existe para poder juzgar el diseño con una parrilla llena en lugar de con una
 * pantalla vacía. Todo lo que crea es reconocible y reversible: los perfiles
 * llevan el prefijo `demo-` y `--remove` los borra junto con todo lo que cuelga
 * de ellos.
 *
 * Los medios se comparten desde `MEDIA_ROOT/demo/media/` en lugar de duplicarse
 * por publicación: son datos de mentira, no hace falta gastar disco.
 */
import crypto from "crypto"
import { inArray, like } from "drizzle-orm"
import { getDb, getPool } from "../lib/db/client"
import {
  comments, invitationCodes, likes, moderationLog, notifications, profiles, works,
} from "../lib/db/schema"
import { hashInviteCode } from "../lib/invitations"
import { normalizeSlug } from "../lib/slug"

const PREFIJO = "demo-"
const TOTAL_PUBLICACIONES = 100

// ---------------------------------------------------------------- aleatoriedad

/** Generador con semilla: dos ejecuciones producen el mismo conjunto. */
let semilla = 20260917
function aleatorio(): number {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296
  return semilla / 4294967296
}
const entero = (min: number, max: number) => Math.floor(aleatorio() * (max - min + 1)) + min
const elegir = <T,>(lista: readonly T[]): T => lista[Math.floor(aleatorio() * lista.length)]
const quizas = (probabilidad: number) => aleatorio() < probabilidad

/** Mayoría de valores bajos y unos pocos muy altos, como ocurre de verdad. */
function distribucionLargaCola(maximo: number): number {
  const r = aleatorio()
  if (r > 0.94) return entero(Math.floor(maximo * 0.5), maximo)
  if (r > 0.75) return entero(Math.floor(maximo * 0.15), Math.floor(maximo * 0.5))
  return entero(0, Math.floor(maximo * 0.15))
}

// ---------------------------------------------------------------- catálogo

// Los medios viven en public/demo, no en MEDIA_ROOT: así viajan con el
// despliegue y los datos de demostración funcionan en cualquier entorno sin
// tener que copiar archivos al servidor a mano.
const MEDIOS = [
  ...Array.from({ length: 9 }, (_, i) => ({ url: `/demo/arte-${i + 1}.jpg`, width: 1200, height: 900, type: "image/jpeg" })),
  { url: "/demo/foto-1.jpg", width: 1200, height: 900, type: "image/jpeg" },
] as const

const VIDEO = { url: "/demo/muestra.mp4", width: 1280, height: 720, type: "video/mp4" }

const PERSONAS = [
  ["Valeria Ocampo", "Escuela de Diseño Elisava"],
  ["Mateo Restrepo", "Universidad Jorge Tadeo Lozano"],
  ["Lucía Ferrer", "IED Madrid"],
  ["Andrés Gil", "Escuela Superior de Diseño de Aragón"],
  ["Camila Sandoval", "Universidad de Palermo"],
  ["Diego Marín", "ELISAVA"],
  ["Sofía Betancur", "Universidad Pontificia Bolivariana"],
  ["Tomás Iriarte", "FADU Buenos Aires"],
  ["Paula Quintero", "Escola Massana"],
  ["Nicolás Vergara", "Universidad del Desarrollo"],
  ["Elena Cifuentes", "BAU Centro Universitario"],
  ["Julián Mesa", "Universidad Nacional de Colombia"],
  ["Renata Salas", "Centro de Diseño Monterrey"],
  ["Ignacio Puig", "Escuela de Arte de Granada"],
] as const

const TITULOS: Record<string, readonly string[]> = {
  Branding: [
    "Identidad para Cafetería Nube", "Rediseño de marca — Librería Vértice",
    "Sistema visual para Festival Raíz", "Marca colectiva de productores del valle",
    "Identidad para estudio de cerámica Barro", "Rebranding de la panadería La Espiga",
  ],
  "Ilustración": [
    "Serie botánica en tinta", "Retratos del mercado central",
    "Bestiario doméstico", "Ilustraciones para cuento infantil",
    "Cartografías imaginarias", "Serie de carteles de cine mudo",
  ],
  "Tipografía": [
    "Familia tipográfica Sena", "Rotulación para fachadas de barrio",
    "Espécimen tipográfico Cauce", "Tipografía display para prensa",
    "Alfabeto experimental en papel", "Revival de una tipografía de plomo",
  ],
  Editorial: [
    "Revista Margen — número 04", "Diseño de catálogo de exposición",
    "Colección de poesía contemporánea", "Memoria anual de fundación cultural",
    "Fanzine sobre arquitectura brutalista", "Libro de fotografía documental",
  ],
  Packaging: [
    "Packaging para café de origen", "Línea de cosmética sólida",
    "Envases para conservas artesanales", "Estuche para vinilo edición limitada",
    "Etiquetas para cervecería local", "Packaging de té por estaciones",
  ],
  "UI/UX": [
    "App de reservas para talleres", "Rediseño del checkout de una tienda",
    "Panel de control para clínica veterinaria", "Sistema de diseño para banca digital",
    "App de seguimiento de hábitos", "Portal de empleo para egresados",
  ],
  "Fotografía": [
    "Serie: luz de invierno", "Retratos de oficios que desaparecen",
    "Arquitectura doméstica en la periferia", "Ensayo fotográfico sobre el agua",
    "La ciudad a las cinco de la mañana", "Naturalezas muertas con fruta local",
  ],
  Motion: [
    "Reel de animación 2026", "Cabecera para podcast de diseño",
    "Motion graphics para campaña social", "Animación tipográfica en bucle",
    "Transiciones para documental", "Pieza generativa audiovisual",
  ],
  Otro: [
    "Señalética para museo regional", "Diseño de mobiliario en madera",
    "Instalación efímera en plaza pública", "Juego de mesa sobre historia local",
  ],
}

const DESCRIPCIONES = [
  "El encargo pedía una identidad que funcionara igual en una fachada que en una etiqueta de dos centímetros. Partí de la forma del logotipo antiguo y la reduje hasta dejar solo lo reconocible.",
  "Trabajé con la restricción de una sola tinta y papel reciclado. Esa limitación acabó definiendo el proyecto más que cualquier decisión estética que hubiera tomado sin ella.",
  "Empecé documentando el proceso durante tres semanas antes de dibujar nada. Las decisiones visuales salieron de esas notas, no al revés.",
  "El cliente llegó con una referencia muy marcada y buena parte del trabajo fue justificar por qué no era el camino. La propuesta final conserva su intención pero no su forma.",
  "Es un proyecto académico que terminé fuera del plazo de entrega porque no me convencía. La versión que subo es la tercera, ya sin nota de por medio.",
  "La paleta viene de fotografías tomadas en el lugar. Quería que los colores tuvieran una procedencia y no fueran una elección de catálogo.",
  "Prototipé en papel antes de tocar la pantalla. Las seis primeras versiones están en el cuaderno y ninguna sobrevivió al primer usuario que las probó.",
  "Un ejercicio de clase que crecí por mi cuenta. Me interesaba entender cómo cambia una retícula cuando el contenido deja de ser texto simulado.",
]

const COMENTARIOS = [
  ["Concepto", "La idea de partida es sólida y se sostiene en todas las piezas. Se nota que hubo investigación antes de dibujar."],
  ["Concepto", "Me convence el planteamiento, aunque creo que la pieza tres se aleja del concepto que defiendes al principio."],
  ["Ejecución", "El acabado está muy cuidado. Los detalles pequeños son los que hacen que esto se vea profesional."],
  ["Ejecución", "Cuidado con el espaciado en las aplicaciones pequeñas, se cierra demasiado y pierde legibilidad."],
  ["Composición", "El equilibrio entre imagen y texto funciona bien. Quizá el margen inferior pide un poco más de aire."],
  ["Composición", "La retícula es coherente y eso se agradece. La última pieza rompe el ritmo, no sé si a propósito."],
  ["Color", "La paleta es sobria sin ser aburrida. Ese tono cálido levanta todo el conjunto."],
  ["Color", "Me cuesta el contraste entre el fondo y el texto secundario; en pantalla pequeña se pierde."],
  ["Tipografía", "Buena elección tipográfica, acompaña sin protagonismo. Revisaría el interlineado en los bloques largos."],
  ["Tipografía", "La jerarquía está clara de un vistazo, que es lo difícil. Bien resuelto."],
  ["Concepto", "Me gustaría ver el proceso. El resultado se entiende pero la decisión clave queda implícita."],
  ["Ejecución", "Muy buen trabajo de producción. La fotografía de las piezas también suma bastante."],
]

const NOMBRES_VISITANTE = ["Visitante", "Anónimo", "Invitada", "Lector"]

// ---------------------------------------------------------------- utilidades

const hace = (dias: number, horas = 0) =>
  new Date(Date.now() - dias * 86_400_000 - horas * 3_600_000)

function mediosDe(indice: number) {
  const cantidad = quizas(0.25) ? entero(3, 6) : entero(1, 3)
  const items: { url: string; width: number; height: number; type: string; order: number }[] = []
  // Una de cada ocho publicaciones abre con vídeo, para que el carrusel se ejercite.
  const conVideo = indice % 8 === 3
  for (let i = 0; i < cantidad; i++) {
    const base = conVideo && i === 0 ? VIDEO : elegir(MEDIOS)
    items.push({ ...base, order: i })
  }
  return items
}

// ---------------------------------------------------------------- borrado

async function borrar() {
  const db = getDb()
  const perfiles = await db.select({ id: profiles.id }).from(profiles).where(like(profiles.username, `${PREFIJO}%`))
  const ids = perfiles.map((p) => p.id)

  if (ids.length === 0) {
    console.log("No hay datos de demostración que borrar.")
    return
  }

  const publicaciones = await db.select({ id: works.id }).from(works).where(inArray(works.authorId, ids))
  const idsObra = publicaciones.map((w) => w.id)

  if (idsObra.length > 0) {
    await db.delete(likes).where(inArray(likes.workId, idsObra))
    await db.delete(comments).where(inArray(comments.workId, idsObra))
    await db.delete(moderationLog).where(inArray(moderationLog.workId, idsObra))
    await db.delete(notifications).where(inArray(notifications.targetId, idsObra))
  }
  // Likes y comentarios que estos perfiles dejaron en publicaciones ajenas.
  await db.delete(likes).where(inArray(likes.userId, ids))
  await db.delete(comments).where(inArray(comments.userId, ids))
  await db.delete(notifications).where(inArray(notifications.userId, ids))
  await db.delete(moderationLog).where(inArray(moderationLog.actorId, ids))
  await db.delete(works).where(inArray(works.authorId, ids))
  await db.delete(invitationCodes).where(inArray(invitationCodes.createdBy, ids))
  await db.update(invitationCodes).set({ usedBy: null }).where(inArray(invitationCodes.usedBy, ids))
  await db.delete(profiles).where(inArray(profiles.id, ids))

  const pool = getPool()
  await pool.query("DELETE FROM `user` WHERE id IN (?)", [ids])

  console.log(`Borrados ${ids.length} perfiles y ${idsObra.length} publicaciones de demostración.`)
}

// ---------------------------------------------------------------- creación

async function crear() {
  const db = getDb()
  const pool = getPool()

  const existentes = await db.select({ id: profiles.id }).from(profiles).where(like(profiles.username, `${PREFIJO}%`))
  if (existentes.length > 0) {
    console.error(`Ya hay ${existentes.length} perfiles de demostración. Ejecuta --remove antes de volver a generar.`)
    process.exit(1)
  }

  // --- Perfiles
  const autores = PERSONAS.map(([nombre, escuela], i) => {
    const id = crypto.randomUUID()
    const usuario = `${PREFIJO}${normalizeSlug(nombre)}`.slice(0, 30)
    return {
      id,
      username: usuario,
      fullName: nombre,
      bio: "Perfil de demostración para evaluar el diseño con contenido real.",
      school: escuela,
      careerYear: elegir(["1º", "2º", "3º", "4º", "Egresado"]),
      categories: [elegir(Object.keys(TITULOS)), elegir(Object.keys(TITULOS))],
      reputationLevel: i < 2 ? 3 : i < 5 ? 2 : i < 9 ? 1 : 0,
      isActive: i !== 12, // uno desactivado, para que el panel de usuarios tenga ambos estados
      createdAt: hace(entero(60, 180)),
      correo: `${usuario}@ejemplo.demo`,
    }
  })

  for (const a of autores) {
    await pool.query(
      "INSERT INTO `user` (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?,?,?,?,?,?)",
      [a.id, a.fullName, a.correo, 1, a.createdAt, a.createdAt],
    )
  }
  await db.insert(profiles).values(autores.map(({ correo, ...p }) => p))
  console.log(`Perfiles creados: ${autores.length}`)

  // --- Publicaciones
  const categorias = Object.keys(TITULOS)
  const usados = new Set<string>()
  const filas: (typeof works.$inferInsert)[] = []

  for (let i = 0; i < TOTAL_PUBLICACIONES; i++) {
    const autor = autores[i % autores.length]
    const categoria = categorias[i % categorias.length]
    const titulo = elegir(TITULOS[categoria])
    let slug = normalizeSlug(titulo)
    let n = 2
    while (usados.has(slug)) slug = `${normalizeSlug(titulo)}-${n++}`
    usados.add(slug)

    // 88 aprobadas, 6 en revisión, 3 rechazadas, 3 archivadas.
    const estado = i < 6 ? "pending_review" : i < 9 ? "rejected" : "approved"
    const archivada = i >= 9 && i < 12
    const creada = hace(entero(1, 90), entero(0, 23))

    filas.push({
      id: crypto.randomUUID(),
      slug,
      authorId: autor.id,
      title: titulo,
      description: elegir(DESCRIPCIONES),
      category: categoria,
      tags: quizas(0.6) ? [elegir(["proceso", "académico", "encargo", "experimental", "impreso", "digital"])] : [],
      images: mediosDe(i),
      moderationStatus: estado as "approved" | "pending_review" | "rejected",
      viewsCount: estado === "approved" ? distribucionLargaCola(900) : entero(0, 12),
      createdAt: creada,
      updatedAt: creada,
      publishedAt: estado === "approved" ? creada : null,
      archivedAt: archivada ? hace(entero(1, 20)) : null,
    })
  }
  await db.insert(works).values(filas)
  console.log(`Publicaciones creadas: ${filas.length}`)

  // --- Likes y comentarios, solo sobre lo publicado y visible
  const visibles = filas.filter((w) => w.moderationStatus === "approved" && !w.archivedAt)
  const megusta: (typeof likes.$inferInsert)[] = []
  const mensajes: (typeof comments.$inferInsert)[] = []

  for (const obra of visibles) {
    const cuantos = distribucionLargaCola(48)
    const yaDieron = new Set<string>()
    for (let i = 0; i < cuantos; i++) {
      if (quizas(0.45)) {
        const quien = elegir(autores)
        if (quien.id === obra.authorId || yaDieron.has(quien.id)) continue
        yaDieron.add(quien.id)
        megusta.push({ id: crypto.randomUUID(), workId: obra.id!, userId: quien.id, visitorId: null, createdAt: hace(entero(0, 45)) })
      } else {
        megusta.push({ id: crypto.randomUUID(), workId: obra.id!, userId: null, visitorId: crypto.randomUUID(), createdAt: hace(entero(0, 45)) })
      }
    }

    for (let i = 0; i < distribucionLargaCola(9); i++) {
      const [categoria, texto] = elegir(COMENTARIOS)
      const deVisitante = quizas(0.3)
      const quien = elegir(autores)
      if (!deVisitante && quien.id === obra.authorId) continue
      mensajes.push({
        id: crypto.randomUUID(),
        workId: obra.id!,
        userId: deVisitante ? null : quien.id,
        visitorId: deVisitante ? crypto.randomUUID() : null,
        visitorName: deVisitante ? elegir(NOMBRES_VISITANTE) : null,
        content: texto,
        categories: [categoria],
        createdAt: hace(entero(0, 40)),
      })
    }
  }

  // En lotes: un INSERT de miles de filas revienta el tamaño máximo de paquete.
  const porLotes = async <T,>(datos: T[], insertar: (lote: T[]) => Promise<unknown>) => {
    for (let i = 0; i < datos.length; i += 400) await insertar(datos.slice(i, i + 400))
  }
  await porLotes(megusta, (lote) => db.insert(likes).values(lote as typeof likes.$inferInsert[]))
  await porLotes(mensajes, (lote) => db.insert(comments).values(lote as typeof comments.$inferInsert[]))
  console.log(`Likes: ${megusta.length} · Comentarios: ${mensajes.length}`)

  // --- Registro de moderación e invitaciones, para que esos paneles no salgan vacíos
  const fundador = (await db.select({ id: profiles.id }).from(profiles).limit(1))[0]
  if (fundador) {
    const decisiones = filas.filter((w) => w.moderationStatus !== "pending_review").slice(0, 18)
    await db.insert(moderationLog).values(decisiones.map((w) => ({
      id: crypto.randomUUID(),
      workId: w.id!,
      workTitle: w.title!,
      actorId: fundador.id,
      action: (w.moderationStatus === "rejected" ? "reject" : w.archivedAt ? "archive" : "approve") as "approve" | "reject" | "archive",
      note: w.moderationStatus === "rejected" ? "Falta documentar el proceso." : null,
      createdAt: hace(entero(1, 60)),
    })))

    const invitaciones = autores.slice(0, 10).map((a, i) => ({
      id: crypto.randomUUID(),
      codeHash: hashInviteCode(`DEMO-${i}-${crypto.randomUUID()}`),
      createdBy: fundador.id,
      usedBy: i < 6 ? a.id : null,
      usedAt: i < 6 ? hace(entero(5, 60)) : null,
      expiresAt: i >= 8 ? hace(entero(1, 10)) : new Date(Date.now() + 30 * 86_400_000),
      createdAt: hace(entero(10, 90)),
    }))
    await db.insert(invitationCodes).values(invitaciones)
    console.log(`Moderación: ${decisiones.length} decisiones · Invitaciones: ${invitaciones.length}`)
  }

  console.log("\nListo. Para deshacerlo:  npx tsx --env-file=.env.local scripts/seed-demo.ts --remove")
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Abortado: este script no debe ejecutarse en producción sin querer.")
    console.error("Si de verdad quieres datos de demostración ahí, ejecútalo con DEMO_EN_PRODUCCION=si")
    if (process.env.DEMO_EN_PRODUCCION !== "si") process.exit(1)
  }

  if (process.argv.includes("--remove")) await borrar()
  else await crear()

  await getPool().end()
}

main().catch(async (error) => {
  console.error("Falló:", error instanceof Error ? error.message : error)
  process.exit(1)
})
