// components/moderation/InviteCodesManager.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface InviteCode {
  id: string
  code: string
  role: string
  claimed_by: string | null
  claimed_at: string | null
  expires_at: string | null
  created_at: string
  // joined from profiles
  claimer_name?: string
}

function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no I,O,1,0 to avoid confusion
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function InviteCodesManager() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [role, setRole] = useState<"early" | "mentor_invite">("early")
  const supabase = createClient()

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch codes created by this founder
      const { data, error } = await supabase
        .from("invitation_codes")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // For claimed codes, fetch claimer names
      const claimed = (data ?? []).filter((c: any) => c.claimed_by)
      let claimerMap: Record<string, string> = {}

      if (claimed.length > 0) {
        const ids = [...new Set(claimed.map((c: any) => c.claimed_by))]
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ids)

        if (profiles) {
          profiles.forEach((p: any) => {
            claimerMap[p.id] = p.full_name
          })
        }
      }

      setCodes(
        (data ?? []).map((c: any) => ({
          ...c,
          claimer_name: c.claimed_by ? claimerMap[c.claimed_by] ?? "—" : undefined,
        }))
      )
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCodes()
  }, [fetchCodes])

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const newCodes = Array.from({ length: quantity }, () => ({
        code: generateCode(),
        created_by: user.id,
        role,
      }))

      const { error } = await supabase
        .from("invitation_codes")
        .insert(newCodes)

      if (error) throw error

      await fetchCodes()
    } catch {
      // Silently fail
    } finally {
      setGenerating(false)
    }
  }, [supabase, quantity, role, fetchCodes])

  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const available = codes.filter((c) => !c.claimed_by)
  const claimed = codes.filter((c) => c.claimed_by)

  return (
    <div>
      {/* Generator */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Generar códigos de invitación
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
            >
              {[1, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "código" : "códigos"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tipo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
            >
              <option value="early">Early access</option>
              <option value="mentor_invite">Mentor invite</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {generating ? "Generando..." : "Generar"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{available.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Disponibles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{claimed.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Reclamados</p>
        </div>
      </div>

      {/* Available codes */}
      {available.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Códigos disponibles
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {available.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg tracking-wider">
                    {c.code}
                  </code>
                  <span className="text-[11px] text-gray-400 hidden sm:block">
                    {c.role === "mentor_invite" ? "Mentor" : "Early"}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(c.code)}
                  className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                    copied === c.code
                      ? "bg-green-50 text-green-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {copied === c.code ? "✓ Copiado" : "Copiar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claimed codes */}
      {claimed.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Códigos reclamados
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {claimed.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono text-gray-400 line-through">
                    {c.code}
                  </code>
                  <span className="text-xs text-gray-500">
                    → {c.claimer_name}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {new Date(c.claimed_at!).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">Cargando códigos...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && codes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-400">
            No has generado códigos aún. Genera tu primer lote arriba.
          </p>
        </div>
      )}
    </div>
  )
}
