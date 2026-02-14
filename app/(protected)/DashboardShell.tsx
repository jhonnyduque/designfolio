// app/(protected)/DashboardShell.tsx
"use client"

import { type ReactNode, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { NotificationBell } from "@/components/notifications/NotificationBell"

export function DashboardShell({
  email,
  isFounder = false,
  children,
}: {
  email: string
  isFounder?: boolean
  children: ReactNode
}) {
  const { signOut } = useAuth()
  const pathname = usePathname()
  const isNewWork = pathname === "/dashboard/new"
  const isModeration = pathname === "/dashboard/moderation"
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <span className="text-lg font-bold tracking-tight text-gray-900">
                  Design<span className="text-gray-400">folio</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  Beta
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Moderation link — only for founders */}
              {isFounder && !isModeration && (
                <Link
                  href="/dashboard/moderation"
                  className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors hidden sm:block"
                >
                  Moderación
                </Link>
              )}

              {/* New Work button — hidden when already on /new */}
              {!isNewWork && !isModeration && (
                <Link
                  href="/dashboard/new"
                  className="px-3.5 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Nueva Obra</span>
                </Link>
              )}

              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Menú de usuario"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
                    <Link
                      href="/dashboard/my-works"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Mis obras
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Editar perfil
                    </Link>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
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
