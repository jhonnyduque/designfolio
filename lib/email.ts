import nodemailer from "nodemailer"

type SendOptions = {
  to: string
  subject: string
  text: string
  /** Opcional: si falta, el correo sale solo en texto plano. */
  html?: string
}

export async function sendEmail(options: SendOptions): Promise<void> {
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

  // Se envían las dos versiones: los filtros antispam penalizan los correos que
  // solo llevan HTML, y algunos clientes muestran únicamente el texto.
  await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    ...(options.html ? { html: options.html } : {}),
  })
}
