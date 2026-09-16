import { betterAuth } from "better-auth"
import { and, eq, gt, isNull, or } from "drizzle-orm"
import { getPool, getDb } from "@/lib/db/client"
import { invitationCodes, profiles } from "@/lib/db/schema"
import { sendEmail } from "@/lib/email"
import { hashInviteCode } from "@/lib/invitations"

export const auth = betterAuth({
  database: getPool(),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      await sendEmail(user.email, "Restablecer contraseña de Designfolio", `Para restablecer tu contraseña, abre este enlace: ${url}`)
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }) {
      await sendEmail(user.email, "Confirma tu correo en Designfolio", `Para confirmar tu correo, abre este enlace: ${url}`)
    },
  },
  // OAuth sign-up stays closed until invitation codes are enforced across redirects.
  socialProviders: {},
  databaseHooks: {
    user: {
      create: {
        /**
         * Reserva el código, sin asignarlo todavía a nadie.
         *
         * `used_by` tiene clave foránea contra `profiles`, y el perfil no existe
         * hasta el hook `after`. Escribirlo aquí provocaba un error 1452 en cada
         * canje. Por eso aquí solo se marca `used_at`: ese UPDATE condicional es
         * atómico y ya impide que dos registros simultáneos usen el mismo código.
         */
        async before(user, context) {
          const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
          if (bootstrapEmail && user.email.toLowerCase() === bootstrapEmail) return

          const inviteCode = context?.headers?.get("x-designfolio-invite")
          if (!inviteCode || inviteCode.length > 64) return false
          const now = new Date()
          const result = await getDb().update(invitationCodes)
            .set({ usedAt: now })
            .where(and(
              eq(invitationCodes.codeHash, hashInviteCode(inviteCode)),
              isNull(invitationCodes.usedAt),
              or(isNull(invitationCodes.expiresAt), gt(invitationCodes.expiresAt, now)),
            ))
          if (result[0].affectedRows !== 1) return false
        },
        /** Crea el perfil y recién entonces asigna el código reservado a su dueño. */
        async after(user, context) {
          const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
          const isBootstrap = Boolean(bootstrapEmail) && user.email.toLowerCase() === bootstrapEmail
          const username = `user-${user.id.slice(0, 8)}`

          await getDb().insert(profiles).values({
            id: user.id,
            username,
            fullName: user.name || username,
            isFounder: isBootstrap,
            onboardingCompleted: isBootstrap,
          })

          const inviteCode = context?.headers?.get("x-designfolio-invite")
          if (isBootstrap || !inviteCode) return
          await getDb().update(invitationCodes)
            .set({ usedBy: user.id })
            .where(eq(invitationCodes.codeHash, hashInviteCode(inviteCode)))
        },
      },
    },
  },
})
