import { betterAuth } from "better-auth"
import { and, eq, gt, isNull, or } from "drizzle-orm"
import { getPool, getDb } from "@/lib/db/client"
import { invitationCodes, profiles } from "@/lib/db/schema"
import { sendEmail } from "@/lib/email"
import { renderAuthEmail } from "@/lib/email-template"
import { hashInviteCode } from "@/lib/invitations"
import { INVITE_COOKIE_NAME, unpackInviteCode } from "@/lib/invite-cookie"

function readGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  return clientId && clientSecret ? { clientId, clientSecret } : null
}

const googleCredentials = readGoogleCredentials()

export const googleSignInEnabled = googleCredentials !== null

/**
 * El código de invitación llega por dos caminos según cómo se registre la persona:
 * por cabecera si usa correo y contraseña, o por cookie firmada si vuelve de Google.
 */
function readInviteCode(headers: Headers | undefined): string | null {
  const fromHeader = headers?.get("x-designfolio-invite")?.trim()
  if (fromHeader) return fromHeader

  const cookieHeader = headers?.get("cookie")
  if (!cookieHeader) return null
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${INVITE_COOKIE_NAME}=`))
  if (!match) return null

  return unpackInviteCode(decodeURIComponent(match.slice(INVITE_COOKIE_NAME.length + 1)))
}

export const auth = betterAuth({
  database: getPool(),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  /**
   * Sin esto, Better Auth no logra resolver la IP del cliente detrás de
   * LiteSpeed y avisa de que cae a "un único bucket compartido": su límite de
   * intentos pasa a aplicarse a todo el mundo junto, de modo que los fallos de
   * login de una persona bloquearían a las demás.
   */
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      const { html, text } = renderAuthEmail({
        heading: "Restablece tu contraseña",
        intro: "Recibimos una solicitud para cambiar la contraseña de tu cuenta. Pulsa el botón y elige una nueva.",
        action: "Elegir nueva contraseña",
        url,
        note: "Este enlace caduca en una hora. Si no pediste el cambio, puedes ignorar este correo: tu contraseña seguirá siendo la misma.",
        preheader: "Elige una contraseña nueva para tu cuenta de Designfolio.",
      })
      await sendEmail({ to: user.email, subject: "Restablece tu contraseña · Designfolio", text, html })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }) {
      const { html, text } = renderAuthEmail({
        heading: "Confirma tu correo",
        intro: "Bienvenido a Designfolio. Solo falta confirmar tu dirección para que puedas empezar a publicar tu trabajo.",
        action: "Confirmar mi correo",
        url,
        note: "Si no creaste esta cuenta, ignora este correo y no se activará nada.",
        preheader: "Confirma tu dirección para activar tu cuenta de Designfolio.",
      })
      await sendEmail({ to: user.email, subject: "Confirma tu correo · Designfolio", text, html })
    },
  },
  /**
   * El acceso con Google solo se declara si hay credenciales configuradas. Así
   * el despliegue no depende de tenerlas, y el botón del formulario aparece o no
   * en consecuencia.
   *
   * La invitación se sigue exigiendo: el código viaja en una cookie firmada que
   * sobrevive al desvío por Google, que es lo que faltaba cuando esto se
   * desactivó (ver lib/invite-cookie.ts).
   */
  socialProviders: googleCredentials
    ? { google: { clientId: googleCredentials.clientId, clientSecret: googleCredentials.clientSecret } }
    : {},
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

          const inviteCode = readInviteCode(context?.headers)
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

          const inviteCode = readInviteCode(context?.headers)
          if (isBootstrap || !inviteCode) return
          await getDb().update(invitationCodes)
            .set({ usedBy: user.id })
            .where(eq(invitationCodes.codeHash, hashInviteCode(inviteCode)))
        },
      },
    },
  },
})
