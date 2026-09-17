import { and, asc, desc, eq, isNull, or, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { comments, invitationCodes, moderationLog, profiles, works } from "@/lib/db/schema"
import type { WorkImage } from "@/types/work"

/**
 * Datos de la portada del panel.
 *
 * Cada cifra va con su comparación respecto al periodo anterior: un número solo
 * dice cuánto, nunca si va bien o mal.
 */

export type Metrica = { valor: number; previo: number }

export type Resumen = {
  publicadas: Metrica
  comentarios: Metrica
  miembros: { activos: number; total: number; nuevos: number }
  invitaciones: { libres: number; canjeadas: number; caducadas: number }
  pendientes: {
    total: number
    /** Horas que lleva esperando la más antigua. */
    esperaMaxima: number
    items: {
      id: string
      titulo: string
      autor: string
      categoria: string
      imagen: string | null
      horas: number
    }[]
  }
  decisiones: {
    id: string
    accion: string
    proyecto: string
    responsable: string
    nota: string | null
    fecha: string
  }[]
}

const DIA = 86_400_000

export async function getResumen(): Promise<Resumen> {
  const db = getDb()
  const ahora = Date.now()
  const hace7 = new Date(ahora - 7 * DIA)
  const hace14 = new Date(ahora - 14 * DIA)
  const hace30 = new Date(ahora - 30 * DIA)

  const [publicadas, comentarios2, miembros, invitaciones, pendientes, colaItems, decisiones] =
    await Promise.all([
      db
        .select({
          valor: sql<number>`sum(${works.publishedAt} >= ${hace7})`,
          previo: sql<number>`sum(${works.publishedAt} >= ${hace14} and ${works.publishedAt} < ${hace7})`,
        })
        .from(works)
        .where(eq(works.moderationStatus, "approved")),

      db
        .select({
          valor: sql<number>`sum(${comments.createdAt} >= ${hace7})`,
          previo: sql<number>`sum(${comments.createdAt} >= ${hace14} and ${comments.createdAt} < ${hace7})`,
        })
        .from(comments),

      db
        .select({
          total: sql<number>`count(*)`,
          activos: sql<number>`sum(${profiles.isActive})`,
          nuevos: sql<number>`sum(${profiles.createdAt} >= ${hace30})`,
        })
        .from(profiles),

      db
        .select({
          libres: sql<number>`sum(${invitationCodes.usedAt} is null and (${invitationCodes.expiresAt} is null or ${invitationCodes.expiresAt} > now()))`,
          canjeadas: sql<number>`sum(${invitationCodes.usedAt} is not null)`,
          caducadas: sql<number>`sum(${invitationCodes.usedAt} is null and ${invitationCodes.expiresAt} <= now())`,
        })
        .from(invitationCodes),

      db
        .select({ total: sql<number>`count(*)` })
        .from(works)
        .where(eq(works.moderationStatus, "pending_review")),

      db
        .select({
          id: works.id,
          titulo: works.title,
          categoria: works.category,
          imagenes: works.images,
          creada: works.createdAt,
          autor: profiles.fullName,
        })
        .from(works)
        .innerJoin(profiles, eq(works.authorId, profiles.id))
        .where(eq(works.moderationStatus, "pending_review"))
        .orderBy(asc(works.createdAt))
        .limit(4),

      db
        .select({
          id: moderationLog.id,
          accion: moderationLog.action,
          proyecto: moderationLog.workTitle,
          nota: moderationLog.note,
          creada: moderationLog.createdAt,
          responsable: profiles.fullName,
        })
        .from(moderationLog)
        .innerJoin(profiles, eq(moderationLog.actorId, profiles.id))
        .orderBy(desc(moderationLog.createdAt))
        .limit(4),
    ])

  const horasDesde = (fecha: Date) => Math.max(0, Math.floor((ahora - fecha.getTime()) / 3_600_000))

  const items = colaItems.map((fila) => ({
    id: fila.id,
    titulo: fila.titulo,
    autor: fila.autor,
    categoria: fila.categoria,
    imagen: (fila.imagenes as WorkImage[] | null)?.[0]?.url ?? null,
    horas: horasDesde(fila.creada),
  }))

  return {
    publicadas: { valor: Number(publicadas[0]?.valor ?? 0), previo: Number(publicadas[0]?.previo ?? 0) },
    comentarios: { valor: Number(comentarios2[0]?.valor ?? 0), previo: Number(comentarios2[0]?.previo ?? 0) },
    miembros: {
      activos: Number(miembros[0]?.activos ?? 0),
      total: Number(miembros[0]?.total ?? 0),
      nuevos: Number(miembros[0]?.nuevos ?? 0),
    },
    invitaciones: {
      libres: Number(invitaciones[0]?.libres ?? 0),
      canjeadas: Number(invitaciones[0]?.canjeadas ?? 0),
      caducadas: Number(invitaciones[0]?.caducadas ?? 0),
    },
    pendientes: {
      total: Number(pendientes[0]?.total ?? 0),
      esperaMaxima: items[0]?.horas ?? 0,
      items,
    },
    decisiones: decisiones.map((fila) => ({
      id: fila.id,
      accion: fila.accion,
      proyecto: fila.proyecto,
      responsable: fila.responsable,
      nota: fila.nota,
      fecha: fila.creada.toISOString(),
    })),
  }
}
