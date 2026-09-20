"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Frame = { time: number; previewUrl: string }

type Props = {
  file: File
  selected: File | undefined
  onSelect: (poster: File) => void
}

const SAMPLE_POSITIONS = [0.1, 0.3, 0.5, 0.7, 0.9]
const POSTER_MAX_EDGE = 1920
const THUMBNAIL_MAX_EDGE = 360

function formatTime(time: number) {
  const seconds = Math.max(0, Math.floor(time))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function waitFor(video: HTMLVideoElement, event: "loadedmetadata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const complete = () => {
      cleanup()
      resolve()
    }
    const fail = () => {
      cleanup()
      reject(new Error("No se pudo leer el vídeo."))
    }
    const cleanup = () => {
      video.removeEventListener(event, complete)
      video.removeEventListener("error", fail)
    }
    video.addEventListener(event, complete, { once: true })
    video.addEventListener("error", fail, { once: true })
  })
}

async function seekTo(video: HTMLVideoElement, time: number) {
  if (Math.abs(video.currentTime - time) < 0.01) return
  const seeking = waitFor(video, "seeked")
  video.currentTime = time
  await seeking
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("No se pudo crear la portada."))
    }, "image/jpeg", quality)
  })
}

async function captureFrame(video: HTMLVideoElement, source: File, time: number, maxEdge: number) {
  await seekTo(video, time)
  if (video.videoWidth < 1 || video.videoHeight < 1) throw new Error("El vídeo todavía no tiene un fotograma disponible.")

  const ratio = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(video.videoWidth * ratio)
  canvas.height = Math.round(video.videoHeight * ratio)
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Tu navegador no pudo preparar la portada.")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  const blob = await canvasBlob(canvas, maxEdge === POSTER_MAX_EDGE ? 0.86 : 0.72)
  const basename = source.name.replace(/\.[^.]+$/, "")
  return new File([blob], `${basename}-portada.jpg`, { type: "image/jpeg" })
}

/**
 * Genera una tira de fotogramas del vídeo local. La selección produce un JPEG
 * persistible: feed, mosaico y el primer render reciben la misma portada.
 */
export function VideoPosterPicker({ file, selected, onSelect }: Props) {
  const playerRef = useRef<HTMLVideoElement>(null)
  const generationRef = useRef(0)
  const url = useMemo(() => URL.createObjectURL(file), [file])
  const selectedUrl = useMemo(() => selected ? URL.createObjectURL(selected) : "", [selected])
  const [frames, setFrames] = useState<Frame[]>([])
  const [selectedTime, setSelectedTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => () => URL.revokeObjectURL(url), [url])
  useEffect(() => () => { if (selectedUrl) URL.revokeObjectURL(selectedUrl) }, [selectedUrl])
  useEffect(() => () => { frames.forEach((frame) => URL.revokeObjectURL(frame.previewUrl)) }, [frames])

  async function selectTime(time: number, source = playerRef.current) {
    if (!source) return
    try {
      setError("")
      const poster = await captureFrame(source, file, time, POSTER_MAX_EDGE)
      onSelect(poster)
      setSelectedTime(time)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la portada.")
    }
  }

  async function buildFrames() {
    const generation = ++generationRef.current
    setLoading(true)
    setError("")
    const sampler = document.createElement("video")
    sampler.muted = true
    sampler.playsInline = true
    sampler.preload = "auto"
    sampler.src = url

    try {
      await waitFor(sampler, "loadedmetadata")
      const duration = Number.isFinite(sampler.duration) && sampler.duration > 0 ? sampler.duration : 0
      const times = duration > 0
        ? SAMPLE_POSITIONS.map((position) => Math.min(Math.max(duration * position, 0), Math.max(duration - 0.05, 0)))
        : [0]
      const nextFrames: Frame[] = []
      for (const time of times) {
        const thumbnail = await captureFrame(sampler, file, time, THUMBNAIL_MAX_EDGE)
        if (generation !== generationRef.current) return
        nextFrames.push({ time, previewUrl: URL.createObjectURL(thumbnail) })
      }
      if (generation !== generationRef.current) return
      setFrames(nextFrames)
      const defaultTime = times[Math.min(1, times.length - 1)] ?? 0
      await selectTime(defaultTime, sampler)
    } catch (cause) {
      if (generation === generationRef.current) {
        setError(cause instanceof Error ? cause.message : "No se pudieron preparar los fotogramas.")
      }
    } finally {
      if (generation === generationRef.current) setLoading(false)
      sampler.removeAttribute("src")
      sampler.load()
    }
  }

  useEffect(() => () => { generationRef.current += 1 }, [])

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-label text-gray-800">Portada del vídeo</h2>
          <p className="mt-1 text-meta text-gray-500">Elige un momento; será la imagen que se vea antes de reproducirlo.</p>
        </div>
        {selectedUrl && <img src={selectedUrl} alt="Portada seleccionada" className="h-14 w-10 rounded object-cover" />}
      </div>

      <video
        ref={playerRef}
        src={url}
        controls
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={() => { void buildFrames() }}
        className="mt-3 max-h-72 w-full rounded-lg bg-gray-900 object-contain"
      />

      <div className="mt-3">
        <p className="mb-2 text-meta text-gray-500">{loading ? "Preparando fotogramas…" : "Elige una portada"}</p>
        <div className="grid grid-cols-5 gap-1.5">
          {frames.map((frame) => (
            <button
              key={frame.time}
              type="button"
              onClick={() => { void selectTime(frame.time) }}
              aria-label={`Usar el fotograma de ${formatTime(frame.time)} como portada`}
              aria-pressed={selectedTime === frame.time}
              className={`relative aspect-[4/5] overflow-hidden rounded border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${selectedTime === frame.time ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-500"}`}
            >
              <img src={frame.previewUrl} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-black/55 py-0.5 text-[10px] tabular-nums text-white">{formatTime(frame.time)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-meta text-gray-500">{selected ? "Portada lista" : "Elige una portada antes de publicar"}</span>
        <button type="button" onClick={() => { void selectTime(playerRef.current?.currentTime ?? 0) }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-action text-gray-700 transition-colors hover:bg-gray-50">
          Usar fotograma actual
        </button>
      </div>
      {error && <p className="mt-2 text-meta text-red-600">{error}</p>}
    </section>
  )
}
