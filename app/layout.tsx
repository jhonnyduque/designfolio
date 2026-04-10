import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Designfolio | Jhonny Duque",
  description:
    "Portafolio interactivo de proyectos creativos de Jhonny Duque.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
