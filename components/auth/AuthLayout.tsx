// components/auth/AuthLayout.tsx
"use client"

import Link from "next/link"
import { type ReactNode, useEffect, useState } from "react"

// 8 premium solid colors — one picked at random per render
const PANEL_COLORS = [
  "#1e293b", // slate deep
  "#0f172a", // midnight navy
  "#1a1a2e", // graphite indigo
  "#064e3b", // emerald deep
  "#312e81", // violet dark
  "#78350f", // amber earth
  "#831843", // rose dark
  "#134e4a", // teal deep
] as const

const LEGALES = [
  { href: "/aviso-legal", texto: "Aviso legal" },
  { href: "/privacidad", texto: "Privacidad" },
  { href: "/terminos", texto: "Términos" },
  { href: "/cookies", texto: "Cookies" },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  // Inicializamos con el primer color para que el servidor y el primer render del cliente coincidan
  const [bgColor, setBgColor] = useState<string>(PANEL_COLORS[0])

  useEffect(() => {
    // Se ejecuta solo en el cliente tras la hidratación, asignando un color aleatorio real
    setBgColor(PANEL_COLORS[Math.floor(Math.random() * PANEL_COLORS.length)])
  }, [])

  return (
    <div className="min-h-screen flex">
      {/* Left panel — desktop only */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-10 text-white"
        style={{ backgroundColor: bgColor }}
      >
        <div>
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight">
              Design<span className="opacity-70">folio</span>
            </span>
          </Link>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            Donde tu trabajo
            <br />
            habla por ti.
          </h1>
          <p className="text-body opacity-70 max-w-sm">
            La comunidad de portafolio para diseñadores emergentes que valora
            la calidad, el feedback profesional y el crecimiento real.
          </p>
        </div>

        <p className="text-meta opacity-40">
          © {new Date().getFullYear()} Designfolio. Beta cerrada.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="flex w-full max-w-md flex-col gap-8">

          {/*
            La marca, solo en móvil: ahí el panel de la izquierda no se ve, y con
            él desaparecía la única forma de volver al feed. Quien llegaba a
            "iniciar sesión" desde un enlace suelto se quedaba sin salida que no
            fuera el botón atrás del navegador.

            Vive aquí y no en cada formulario porque antes solo la tenía
            LoginForm; registro, recuperar contraseña y alta no tenían ninguna.
          */}
          <Link href="/" aria-label="Volver a Designfolio" className="inline-block lg:hidden">
            <span className="text-page-title text-gray-900">
              Design<span className="text-gray-400">folio</span>
            </span>
          </Link>

          <div>{children}</div>

          {/*
            Las políticas, al alcance de quien está a punto de crear una cuenta.
            No estaban enlazadas en ninguna pantalla de acceso, así que se podía
            firmar el alta sin haber visto nunca los términos ni el tratamiento
            de datos.
          */}
          <nav aria-label="Información legal" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-gray-400">
            {LEGALES.map(({ href, texto }, i) => (
              <span key={href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                <Link href={href} className="transition-colors hover:text-gray-600 hover:underline">
                  {texto}
                </Link>
              </span>
            ))}
          </nav>

        </div>
      </div>
    </div>
  )
}
