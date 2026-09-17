// components/moderation/DemoData.tsx
"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/Panel"
import { estadoDemoAction, importarDemoAction, quitarDemoAction } from "@/lib/server/actions/demo"

/**
 * Carga y retirada de los datos de demostración, desde el propio panel.
 *
 * Existe porque el volcado no se puede importar desde fuera sin manejar la
 * contraseña de la base. Aquí la aplicación ya la tiene, y la acción está
 * limitada a la cuenta fundadora.
 */
export function DemoData() {
  const [estado, setEstado] = useState<{ perfiles: number; obras: number } | null>(null)
  const [enCurso, setEnCurso] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmarRetirada, setConfirmarRetirada] = useState(false)

  const cargarEstado = useCallback(async () => {
    try {
      setEstado(await estadoDemoAction())
    } catch {
      setEstado(null)
    }
  }, [])

  useEffect(() => {
    cargarEstado()
  }, [cargarEstado])

  const ejecutar = useCallback(
    async (operacion: typeof importarDemoAction, exito: string) => {
      setEnCurso(true)
      setMensaje(null)
      setError(null)
      const r = await operacion()
      if (r.success) setMensaje(r.detalle ? `${exito}: ${r.detalle}.` : `${exito}.`)
      else setError(r.error ?? "La operación no se pudo completar.")
      setEnCurso(false)
      setConfirmarRetirada(false)
      await cargarEstado()
    },
    [cargarEstado],
  )

  const cargados = (estado?.perfiles ?? 0) > 0

  return (
    <section className="mt-10 border-t border-gray-200 pt-6">
      <h2 className="text-[14px] font-medium text-gray-900">Datos de demostración</h2>
      <p className="mt-1.5 max-w-[62ch] text-[13px] leading-relaxed text-gray-500">
        {cargados
          ? `Hay ${estado?.perfiles} perfiles y ${estado?.obras} publicaciones de mentira en la plataforma. Son visibles para cualquiera que entre a Proyectos, así que conviene retirarlos antes de enseñarle el sitio a alguien.`
          : "Carga 14 perfiles y 100 publicaciones ficticias para ver el panel con la parrilla llena en lugar de con la pantalla vacía. Se pueden retirar en cualquier momento sin tocar lo real."}
      </p>

      {mensaje && <p className="mt-3 text-[13px] text-gray-900">{mensaje}</p>}
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {cargados ? (
          confirmarRetirada ? (
            <>
              <Button onClick={() => setConfirmarRetirada(false)} disabled={enCurso}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={enCurso}
                onClick={() => ejecutar(quitarDemoAction, "Retirados")}
              >
                {enCurso ? "Retirando…" : "Sí, retirar todo"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setConfirmarRetirada(true)} disabled={enCurso}>
              Retirar los datos de demostración
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            disabled={enCurso}
            onClick={() => ejecutar(importarDemoAction, "Cargados")}
          >
            {enCurso ? "Cargando…" : "Cargar datos de demostración"}
          </Button>
        )}
      </div>
    </section>
  )
}
