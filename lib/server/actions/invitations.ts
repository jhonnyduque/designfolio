"use server"

import crypto from "crypto"
import { and, desc, eq, isNull } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db/client"
import { hashInviteCode } from "@/lib/invitations"
import { invitationCodes, profiles } from "@/lib/db/schema"

/** Sin I, O, 1 ni 0: se dictan y se teclean sin confundirlos. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const CODE_LENGTH = 26 // 26 × log2(32) = 130 bits de entropía
const MAX_BATCH = 20

export type InviteCodeRow = {
  id: string
  created_at: string
  expires_at: string | null
  used_at: string | null
  used_by_name: string | null
  status: "active" | "used" | "expired"
}

export type CreateInviteResult =
  | { success: true; codes: string[] }
  | { success: false; error: string }

export type InviteActionResult = { success: boolean; error?: string }

async function requireFounder() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("No autenticado")

  const [profile] = await getDb()
    .select({ id: profiles.id, isFounder: profiles.isFounder, isActive: profiles.isActive })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  if (!profile?.isFounder || !profile.isActive) throw new Error("No autorizado")
  return profile
}

/** Aleatoriedad criptográfica sin sesgo de módulo: descarta los bytes sobrantes. */
function generateCode(): string {
  let code = ""
  while (code.length < CODE_LENGTH) {
    for (const byte of crypto.randomBytes(CODE_LENGTH)) {
      if (byte >= 256 - (256 % ALPHABET.length)) continue
      code += ALPHABET[byte % ALPHABET.length]
      if (code.length === CODE_LENGTH) break
    }
  }
  return code.match(/.{1,6}/g)!.join("-")
}

/**
 * Genera códigos nuevos. Es la ÚNICA vez que se ven en claro: en base solo
 * queda el hash, así que no hay forma de recuperarlos después.
 */
export async function createInviteCodesAction(
  quantity: number,
  expiresInDays: number | null = 30,
): Promise<CreateInviteResult> {
  try {
    const founder = await requireFounder()

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_BATCH) {
      throw new Error(`Puedes generar entre 1 y ${MAX_BATCH} códigos a la vez.`)
    }
    if (expiresInDays !== null && (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 365)) {
      throw new Error("La expiración debe estar entre 1 y 365 días.")
    }

    const expiresAt = expiresInDays === null
      ? null
      : new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

    const codes = Array.from({ length: quantity }, generateCode)

    await getDb().insert(invitationCodes).values(
      codes.map((code) => ({
        id: crypto.randomUUID(),
        codeHash: hashInviteCode(code),
        createdBy: founder.id,
        expiresAt,
      })),
    )

    return { success: true, codes }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado" }
  }
}

export async function getInviteCodesAction(): Promise<InviteCodeRow[]> {
  const founder = await requireFounder()

  const rows = await getDb()
    .select({
      id: invitationCodes.id,
      createdAt: invitationCodes.createdAt,
      expiresAt: invitationCodes.expiresAt,
      usedAt: invitationCodes.usedAt,
      usedByName: profiles.fullName,
    })
    .from(invitationCodes)
    .leftJoin(profiles, eq(invitationCodes.usedBy, profiles.id))
    .where(eq(invitationCodes.createdBy, founder.id))
    .orderBy(desc(invitationCodes.createdAt))

  const now = Date.now()
  return rows.map((row) => ({
    id: row.id,
    created_at: row.createdAt.toISOString(),
    expires_at: row.expiresAt?.toISOString() ?? null,
    used_at: row.usedAt?.toISOString() ?? null,
    used_by_name: row.usedByName ?? null,
    status: row.usedAt
      ? "used"
      : row.expiresAt && row.expiresAt.getTime() <= now
        ? "expired"
        : "active",
  }))
}

/** Revoca un código que todavía no se ha canjeado. Los usados no se tocan: son historial. */
export async function revokeInviteCodeAction(id: string): Promise<InviteActionResult> {
  try {
    const founder = await requireFounder()

    const result = await getDb()
      .delete(invitationCodes)
      .where(and(
        eq(invitationCodes.id, id),
        eq(invitationCodes.createdBy, founder.id),
        isNull(invitationCodes.usedAt),
      ))

    if (result[0].affectedRows !== 1) {
      throw new Error("El código no existe, no es tuyo o ya fue utilizado.")
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado" }
  }
}
