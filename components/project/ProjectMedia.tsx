"use client"

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react"

export interface ProjectMediaItem {
  url: string
  width: number
  height: number
  type: string
  order: number
}

type Props = {
  media: ProjectMediaItem[]
  alt: string
}

/** Galería interactiva del proyecto; no conoce rutas, permisos ni la superficie que la contiene. */
export function ProjectMedia({ media, alt }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const hasMultipleImages = media.length > 1
  const currentImage = media[selectedImage]

  const goPrevImage = useCallback(() => {
    if (!hasMultipleImages) return
    setSelectedImage((previous) => (previous === 0 ? media.length - 1 : previous - 1))
  }, [hasMultipleImages, media.length])

  const goNextImage = useCallback(() => {
    if (!hasMultipleImages) return
    setSelectedImage((previous) => (previous === media.length - 1 ? 0 : previous + 1))
  }, [hasMultipleImages, media.length])

  const openVideoFullscreen = useCallback(() => {
    const video = videoRef.current
    if (video?.requestFullscreen) void video.requestFullscreen()
  }, [])

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
    touchEndX.current = null
  }, [hasMultipleImages])

  const handleTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return
    touchEndX.current = event.changedTouches[0]?.clientX ?? null
  }, [hasMultipleImages])

  const handleTouchEnd = useCallback(() => {
    if (!hasMultipleImages || touchStartX.current == null || touchEndX.current == null) return
    const deltaX = touchStartX.current - touchEndX.current
    if (deltaX > 40) goNextImage()
    if (deltaX < -40) goPrevImage()
    touchStartX.current = null
    touchEndX.current = null
  }, [goNextImage, goPrevImage, hasMultipleImages])

  useEffect(() => {
    if (!hasMultipleImages) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrevImage()
      if (event.key === "ArrowRight") goNextImage()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goNextImage, goPrevImage, hasMultipleImages])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightboxOpen])

  return (
    <>
      {currentImage && (
        <div
          className="group relative w-full overflow-hidden rounded-2xl border border-black/10 bg-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentImage.type?.startsWith("video/") ? (
            <>
              <video ref={videoRef} src={currentImage.url} className="block h-auto max-h-[820px] w-full object-contain bg-black" controls playsInline preload="metadata" />
              <button type="button" onClick={openVideoFullscreen} className="absolute bottom-3 right-3 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-action text-gray-800 backdrop-blur hover:bg-white">
                Pantalla completa
              </button>
            </>
          ) : (
            <img src={currentImage.url} alt={alt} onClick={() => setLightboxOpen(true)} className="block h-auto w-full cursor-zoom-in object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
          )}
          {hasMultipleImages && (
            <>
              <button type="button" onClick={goPrevImage} className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/70 text-meta leading-none text-black/45 opacity-0 shadow-sm transition-all hover:bg-white hover:text-black/70 group-hover:opacity-100 focus:opacity-100" aria-label="Imagen anterior">←</button>
              <button type="button" onClick={goNextImage} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/70 text-meta leading-none text-black/45 opacity-0 shadow-sm transition-all hover:bg-white hover:text-black/70 group-hover:opacity-100 focus:opacity-100" aria-label="Siguiente imagen">→</button>
            </>
          )}
        </div>
      )}

      {hasMultipleImages && (
        <div className="mt-3 hidden gap-2 overflow-x-auto pb-1 sm:flex">
          {media.map((item, index) => (
            <button key={index} onClick={() => setSelectedImage(index)} className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${index === selectedImage ? "border-gray-900" : "border-transparent hover:border-gray-300"}`}>
              <img src={item.url} alt={`${index + 1}`} className={`h-full w-full ${item.type?.startsWith("video/") ? "hidden" : "object-cover"}`} />
              {item.type?.startsWith("video/") && <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />}
            </button>
          ))}
        </div>
      )}

      {hasMultipleImages && (
        <div className="mt-3 flex items-center justify-center gap-1.5 sm:hidden">
          {media.map((_, index) => (
            <button key={`dot-${index}`} type="button" onClick={() => setSelectedImage(index)} aria-label={`Ir a imagen ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === selectedImage ? "w-5 bg-gray-900" : "w-1.5 bg-gray-300"}`} />
          ))}
        </div>
      )}

      {lightboxOpen && currentImage && !currentImage.type?.startsWith("video/") && (
        <div className="fixed inset-0 z-[70] bg-black/80 p-4 md:p-8" onClick={() => setLightboxOpen(false)}>
          <button type="button" onClick={() => setLightboxOpen(false)} className="absolute right-4 top-4 z-[71] rounded-full bg-white/90 px-3 py-1 text-action text-gray-900">Cerrar</button>
          <div className="flex h-full w-full items-center justify-center">
            <img src={currentImage.url} alt={alt} className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
          </div>
        </div>
      )}
    </>
  )
}
