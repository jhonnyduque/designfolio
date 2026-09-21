"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

type OwnerAction = "archive" | "delete"

type Props = {
  workId: string
  onRemoved: (action: "archived" | "deleted") => void
}

/**
 * Acciones contextuales exclusivas del propietario de una publicación.
 *
 * La visibilidad la decide el componente padre comparando la sesión pública con
 * author_id. La API vuelve a comprobar la propiedad antes de archivar/eliminar:
 * ocultar el menú es UX, no una frontera de seguridad.
 */
export function OwnerPostMenu({ workId, onRemoved }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<OwnerAction | null>(null)
  const [busy, setBusy] = useState<OwnerAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  async function executeAction(action: OwnerAction) {
    setBusy(action)
    setError(null)

    try {
      const response = await fetch(
        `/api/works/${workId}`,
        action === "archive"
          ? {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ archived: true }),
            }
          : { method: "DELETE" },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(
          data?.error ??
            (action === "archive"
              ? "No se pudo archivar la publicación."
              : "No se pudo eliminar la publicación."),
        )
      }

      setConfirmAction(null)
      setOpen(false)
      onRemoved(action === "archive" ? "archived" : "deleted")
    } catch (actionError) {
      setConfirmAction(null)
      setOpen(true)
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo completar la acción.",
      )
    } finally {
      setBusy(null)
    }
  }

  const confirmation =
    confirmAction === "archive"
      ? {
          title: "¿Archivar esta publicación?",
          body: "Dejará de aparecer en el feed público. Podrás gestionarla después desde Mis proyectos.",
          confirmLabel: "Archivar",
        }
      : {
          title: "¿Eliminar esta publicación?",
          body: "La publicación y sus interacciones asociadas se eliminarán. Esta acción no se puede deshacer.",
          confirmLabel: "Eliminar",
        }

  return (
    <>
      <div ref={rootRef} className="relative ml-auto shrink-0">
        <button
          type="button"
          aria-label="Acciones de la publicación"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => {
            setError(null)
            setOpen((value) => !value)
          }}
          className="grid h-8 w-8 place-items-center rounded-full text-gray-700 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-9 z-30 w-max min-w-[9.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-black/10 bg-white py-1.5 shadow-lg"
          >
            <Link
              href={`/dashboard/work/${workId}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-body-sm text-gray-900 transition-colors hover:bg-black/[.04]"
            >
              Editar
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmAction("archive")}
              className="block w-full px-4 py-2.5 text-left text-body-sm text-gray-900 transition-colors hover:bg-black/[.04]"
            >
              Archivar
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmAction("delete")}
              className="block w-full px-4 py-2.5 text-left text-body-sm text-red-600 transition-colors hover:bg-red-50"
            >
              Eliminar
            </button>

            {error && (
              <p role="alert" className="mt-1 border-t border-black/5 px-4 py-2 text-meta text-red-600">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {confirmAction && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) setConfirmAction(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`owner-action-${workId}`}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
          >
            <h2
              id={`owner-action-${workId}`}
              className="text-section font-semibold text-gray-900"
            >
              {confirmation.title}
            </h2>
            <p className="mt-2 text-body-sm leading-relaxed text-gray-600">
              {confirmation.body}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => setConfirmAction(null)}
                className="rounded-lg px-4 py-2 text-action text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void executeAction(confirmAction)}
                className={
                  confirmAction === "delete"
                    ? "rounded-lg bg-red-600 px-4 py-2 text-action text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    : "rounded-lg bg-gray-900 px-4 py-2 text-action text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                }
              >
                {busy ? "Procesando..." : confirmation.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
