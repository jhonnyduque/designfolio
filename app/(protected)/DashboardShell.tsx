// app/(protected)/DashboardShell.tsx
"use client"

import { type ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"

export function DashboardShell({
  email,
  children,
}: {
  email: string
  children: ReactNode
}) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Design<span className="text-gray-400">folio</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                Beta
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[200px]">
                {email}
              </span>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
