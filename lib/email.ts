import nodemailer from "nodemailer"

export async function sendEmail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST
  const from = process.env.SMTP_FROM
  if (!host || !from) {
    throw new Error("El correo saliente no está configurado.")
  }

  const port = Number(process.env.SMTP_PORT ?? "587")
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD
  if (Boolean(user) !== Boolean(password)) {
    throw new Error("SMTP_USER y SMTP_PASSWORD deben configurarse juntos.")
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && password ? { user, pass: password } : undefined,
  })

  await transport.sendMail({ from, to, subject, text })
}
