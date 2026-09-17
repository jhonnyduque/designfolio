/**
 * Plantilla de los correos transaccionales.
 *
 * El HTML de correo no es HTML de web: muchos clientes eliminan las hojas de
 * estilo, no entienden flexbox ni grid, y Outlook ignora buena parte de CSS. Por
 * eso aquí todo va con tablas de maquetación y estilos en línea, que es lo único
 * que se renderiza igual en Gmail, Outlook, Apple Mail y los clientes de móvil.
 *
 * Tampoco se cargan tipografías externas: Gmail las bloquea. Se usan pilas de
 * fuentes del sistema que evocan la marca —serif con caracter para los títulos,
 * sans para el texto— en lugar de arriesgarse a un resultado distinto en cada
 * bandeja.
 */

import { BRAND } from "@/lib/brand"

type AuthEmailOptions = {
  /** Título grande, en serif. */
  heading: string
  /** Párrafo bajo el título. */
  intro: string
  /** Texto del botón. */
  action: string
  /** Destino del botón. */
  url: string
  /** Nota al pie, normalmente sobre caducidad o qué hacer si no fuiste tú. */
  note: string
  /** Línea de vista previa que muestran las bandejas junto al asunto. */
  preheader: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const SERIF = "'Gallery Modern', Marcellus, 'Playfair Display', Georgia, 'Times New Roman', serif"
const SANS = "Syne, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

export function renderAuthEmail(options: AuthEmailOptions): { html: string; text: string } {
  const url = escapeHtml(options.url)
  const heading = escapeHtml(options.heading)
  const intro = escapeHtml(options.intro)
  const action = escapeHtml(options.action)
  const note = escapeHtml(options.note)
  const preheader = escapeHtml(options.preheader)

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${heading}</title>
</head>
<body style="margin:0; padding:0; width:100%; background-color:${BRAND.background};">

<!-- Línea de vista previa: la bandeja la muestra junto al asunto, pero no debe verse al abrir. -->
<div style="display:none; font-size:1px; color:${BRAND.background}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preheader}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.background};">
<tr>
<td align="center" style="padding:40px 16px;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:100%;">

    <!-- Marca -->
    <tr>
      <td align="center" style="padding:0 0 28px 0;">
        <span style="font-family:${SANS}; font-size:20px; letter-spacing:-0.02em; font-weight:700; color:${BRAND.foreground};">Design</span><span style="font-family:${SANS}; font-size:20px; letter-spacing:-0.02em; font-weight:700; color:${BRAND.muted};">folio</span>
      </td>
    </tr>

    <!-- Tarjeta -->
    <tr>
      <td style="background-color:${BRAND.surface}; border:1px solid ${BRAND.border}; border-radius:16px;">

        <!-- Franja de acento -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td height="4" style="height:4px; line-height:4px; font-size:4px; background-color:${BRAND.accentDeep}; border-radius:16px 16px 0 0;">&nbsp;</td></tr>
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:44px 48px 40px 48px;">

              <h1 style="margin:0 0 16px 0; font-family:${SERIF}; font-size:30px; line-height:1.2; font-weight:400; color:${BRAND.foreground};">${heading}</h1>

              <p style="margin:0 0 32px 0; font-family:${SANS}; font-size:15px; line-height:1.65; color:${BRAND.muted};">${intro}</p>

              <!-- Botón: tabla con bgcolor, que es lo único que Outlook respeta -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="${BRAND.accent}" style="border-radius:10px;">
                    <a href="${url}" target="_blank" rel="noopener" style="display:inline-block; padding:15px 32px; font-family:${SANS}; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">${action}</a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0 0; font-family:${SANS}; font-size:13px; line-height:1.6; color:${BRAND.muted};">${note}</p>

              <!-- Separador -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:32px 0 0 0;">
                <tr><td height="1" style="height:1px; line-height:1px; font-size:1px; background-color:${BRAND.border};">&nbsp;</td></tr>
              </table>

              <p style="margin:24px 0 8px 0; font-family:${SANS}; font-size:12px; line-height:1.5; color:${BRAND.muted};">Si el botón no funciona, copia esta dirección en tu navegador:</p>
              <p style="margin:0; font-family:${SANS}; font-size:12px; line-height:1.5; word-break:break-all;"><a href="${url}" target="_blank" rel="noopener" style="color:${BRAND.accentDeep}; text-decoration:underline;">${url}</a></p>

            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- Pie -->
    <tr>
      <td align="center" style="padding:28px 24px 0 24px;">
        <p style="margin:0 0 6px 0; font-family:${SANS}; font-size:12px; line-height:1.6; color:${BRAND.muted};">Designfolio · Portafolio de proyectos creativos</p>
        <p style="margin:0; font-family:${SANS}; font-size:12px; line-height:1.6;"><a href="${BRAND.siteUrl}" target="_blank" rel="noopener" style="color:${BRAND.muted}; text-decoration:none;">${BRAND.siteHost}</a></p>
      </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>`

  // Alternativa en texto plano. No es opcional: los filtros antispam penalizan
  // los correos que solo llevan HTML, y algunos clientes solo muestran esto.
  const text = [
    options.heading,
    "",
    options.intro,
    "",
    `${options.action}: ${options.url}`,
    "",
    options.note,
    "",
    "—",
    `Designfolio · ${BRAND.siteHost}`,
  ].join("\n")

  return { html, text }
}
