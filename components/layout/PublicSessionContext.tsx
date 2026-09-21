"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { SesionPublica } from "@/components/layout/PublicMenu"

const PublicSessionContext = createContext<SesionPublica>(null)

export function PublicSessionProvider({
  sesion,
  children,
}: {
  sesion: SesionPublica
  children: ReactNode
}) {
  return (
    <PublicSessionContext.Provider value={sesion}>
      {children}
    </PublicSessionContext.Provider>
  )
}

export function usePublicSession() {
  return useContext(PublicSessionContext)
}
