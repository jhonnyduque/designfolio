"use client"

import { useCallback, useState } from "react"
import { validateMediaFile } from "@/lib/media"
import { normalizeSlug, slugifyProjectTitle } from "@/lib/slug"
import { WORK_LIMITS, type CreateWorkPayload, type WorkImage } from "@/types/work"

type PublishStep = "idle" | "uploading" | "saving" | "done" | "error"

interface UseCreateWorkReturn {
  publish: (files: File[], payload: Omit<CreateWorkPayload, "images">, posters?: Map<File, File>) => Promise<string | null>
  step: PublishStep
  progress: string
  error: string | null
  wasAutoApproved: boolean
  reset: () => void
}

async function getMediaDimensions(file: File): Promise<Pick<WorkImage, "width" | "height">> {
  if (file.type.startsWith("video/")) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve({ width: video.videoWidth, height: video.videoHeight })
      }
      video.onerror = () => reject(new Error(`No se pudo leer el video \"${file.name}\". Exporta un MP4 H.264 o WebM válido.`))
      video.src = URL.createObjectURL(file)
    })
  }
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(image.src)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => reject(new Error(`No se pudo leer la imagen \"${file.name}\".`))
    image.src = URL.createObjectURL(file)
  })
}

async function responseError(response: Response) {
  try {
    const data = await response.json()
    if (typeof data.error === "string") return data.error
  } catch {
    // The fallback below is deliberately user-facing.
  }
  return `El servidor respondió con el error ${response.status}. Inténtalo de nuevo.`
}

export function useCreateWorkMySql(): UseCreateWorkReturn {
  const [step, setStep] = useState<PublishStep>("idle")
  const [progress, setProgress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [wasAutoApproved, setWasAutoApproved] = useState(false)

  const reset = useCallback(() => {
    setStep("idle")
    setProgress("")
    setError(null)
    setWasAutoApproved(false)
  }, [])

  const publish = useCallback(async (files: File[], payload: Omit<CreateWorkPayload, "images">, posters = new Map<File, File>()) => {
    setError(null)
    try {
      if (files.length < WORK_LIMITS.IMAGES_MIN || files.length > WORK_LIMITS.IMAGES_MAX) throw new Error(`Debes subir entre ${WORK_LIMITS.IMAGES_MIN} y ${WORK_LIMITS.IMAGES_MAX} medios.`)
      for (const file of files) {
        const fileError = validateMediaFile(file)
        if (fileError) throw new Error(`${file.name}: ${fileError}`)
      }
      const slug = normalizeSlug(payload.slug?.trim() || slugifyProjectTitle(payload.title))
      if (!slug) throw new Error("El slug no es válido. Usa letras, números y guiones.")

      const workId = crypto.randomUUID()
      setStep("uploading")
      const images: WorkImage[] = []
      for (const [order, file] of files.entries()) {
        setProgress(`Subiendo ${order + 1} de ${files.length}: ${file.name}`)
        const formData = new FormData()
        formData.set("file", file)
        formData.set("workId", workId)
        formData.set("order", String(order))
        const upload = await fetch("/api/works/upload", { method: "POST", body: formData })
        if (!upload.ok) throw new Error(await responseError(upload))
        const { url } = await upload.json() as { url: string }
        const dimensions = await getMediaDimensions(file)
        const poster = posters.get(file)
        let posterUrl: string | undefined
        if (poster) {
          const posterData = new FormData()
          posterData.set("file", poster)
          posterData.set("workId", workId)
          posterData.set("order", String(order))
          posterData.set("role", "poster")
          const posterUpload = await fetch("/api/works/upload", { method: "POST", body: posterData })
          if (!posterUpload.ok) throw new Error(await responseError(posterUpload))
          posterUrl = (await posterUpload.json() as { url: string }).url
        }
        images.push({ url, posterUrl, ...dimensions, type: file.type, order })
      }

      setStep("saving")
      setProgress("Validando y publicando el proyecto...")
      const response = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: workId, slug, ...payload, images }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      const result = await response.json() as { id: string; moderationStatus: "approved" | "pending_review" }
      setWasAutoApproved(result.moderationStatus === "approved")
      setProgress(result.moderationStatus === "approved" ? "Proyecto publicado" : "Proyecto enviado a revisión")
      setStep("done")
      return result.id
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "No se pudo publicar por un error inesperado."
      setError(message.includes("Failed to fetch") ? "No se pudo conectar con el servidor local. Confirma que `npm run dev` sigue en ejecución e inténtalo de nuevo." : message)
      setStep("error")
      return null
    }
  }, [])

  return { publish, step, progress, error, wasAutoApproved, reset }
}
