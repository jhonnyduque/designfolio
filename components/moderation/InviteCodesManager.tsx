// components/moderation/InviteCodesManager.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import {
  createInviteCodesAction,
  getInviteCodesAction,
  revokeInviteCodeAction,
  type InviteCodeRow,
} from "@/lib/server/actions/invitations"

const QUANTITIES = [1, 3, 5, 10]
const EXPIRATIONS: [number | null, string][] = [
  [7, "7 días"],
  [30, "30 días"],
  [90, "90 días"],
  [null, "Sin caducidad"],
]

const STATUS_STYLES: Record<InviteCodeRow["status"], string> = {
  active: "bg-green-50 text-green-700",
  used: "bg-gray-100 text-gray-600",
  expired: "bg-amber-50 text-amber-700",
}

const STATUS_LABELS: Record<InviteCodeRow["status"], string> = {
  active: "Disponible",
  used: "Canjeado",
  expired: "Caducado",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function InviteCodesManager() {
  const [codes, setCodes] = useState<InviteCodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [expiresInDays, setExpiresInDays] = useState<number | null>(30)
  // Los códigos recién generados. Es la única vez que existen en claro: en base
  // solo se guarda su hash, así que al recargar la página desaparecen.
  const [freshCodes, setFreshCodes] = useState<string[]>([])

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCodes(await getInviteCodesAction())
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las invitaciones.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCodes()
  }, [fetchCodes])

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setError(null)
    const result = await createInviteCodesAction(quantity, expiresInDays)
    if (result.success) {
      setFreshCodes(result.codes)
      await fetchCodes()
    } else {
      setError(result.error)
    }
    setGenerating(false)
  }, [quantity, expiresInDays, fetchCodes])

  const handleRevoke = useCallback(
    async (id: string) => {
      setError(null)
      const result = await revokeInviteCodeAction(id)
      if (result.success) {
        setCodes((prev) => prev.filter((c) => c.id !== id))
      } else {
        setError(result.error ?? "No se pudo revocar el código.")
      }
    },
    []
  )

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const activeCount = codes.filter((c) => c.status === "active").length

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Generador */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Generar códigos de invitación
        </h3>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {QUANTITIES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQuantity(n)}
              className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                quantity === n
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {n}
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-1">
            {quantity === 1 ? "código" : "códigos"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {EXPIRATIONS.map(([days, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setExpiresInDays(days)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                expiresInDays === days
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {generating ? "Generando..." : "Generar"}
        </button>
      </div>

      {/* Códigos recién generados: única oportunidad de copiarlos */}
      {freshCodes.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Copia estos códigos ahora
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                En la base de datos solo se guarda su huella. Si cierras esta vista,
                no hay forma de recuperarlos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFreshCodes([])}
              className="text-xs text-amber-800 hover:underline shrink-0"
            >
              Ya los copié
            </button>
          </div>

          <div className="space-y-2">
            {freshCodes.map((code) => (
              <div
                key={code}
                className="flex items-center justify-between gap-3 bg-white rounded-lg border border-amber-200 px-3 py-2"
              >
                <code className="text-sm font-mono text-gray-900 break-all">{code}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(code)}
                  className="text-xs text-gray-600 hover:text-gray-900 shrink-0"
                >
                  {copied === code ? "Copiado" : "Copiar"}
                </button>
              </div>
            ))}
          </div>

          {freshCodes.length > 1 && (
            <button
              type="button"
              onClick={() => handleCopy(freshCodes.join("\n"))}
              className="mt-3 text-xs text-amber-900 hover:underline"
            >
              Copiar los {freshCodes.length} juntos
            </button>
          )}
        </div>
      )}

      {/* Listado */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Invitaciones ({codes.length})
        </h3>
        <span className="text-xs text-gray-500">{activeCount} disponibles</span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Cargando...</p>
      ) : codes.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Todavía no has generado ninguna invitación.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {codes.map((code) => (
            <div key={code.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[code.status]}`}
                  >
                    {STATUS_LABELS[code.status]}
                  </span>
                  {code.used_by_name && (
                    <span className="text-sm text-gray-900 truncate">
                      {code.used_by_name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Creado el {formatDate(code.created_at)}
                  {code.expires_at && ` · caduca el ${formatDate(code.expires_at)}`}
                  {code.used_at && ` · canjeado el ${formatDate(code.used_at)}`}
                </p>
              </div>

              {code.status !== "used" && (
                <button
                  type="button"
                  onClick={() => handleRevoke(code.id)}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors shrink-0"
                >
                  Revocar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
