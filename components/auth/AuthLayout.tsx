// components/auth/AuthLayout.tsx
"use client"

import Link from "next/link"
import { type ReactNode, useMemo } from "react"

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

export function AuthLayout({ children }: { children: ReactNode }) {
  const bgColor = useMemo(
    () => PANEL_COLORS[Math.floor(Math.random() * PANEL_COLORS.length)],
    []
  )

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
          <p className="text-base opacity-70 max-w-sm leading-relaxed">
            La comunidad de portafolio para diseñadores emergentes que valora
            la calidad, el feedback profesional y el crecimiento real.
          </p>
        </div>

        <p className="text-xs opacity-40">
          © {new Date().getFullYear()} Designfolio. Beta cerrada.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
