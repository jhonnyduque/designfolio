"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { pinchDistance, pinchMidpoint, pinchTransform, type PinchPoint } from "@/lib/pinch-zoom"

let activeVideo: HTMLVideoElement | null = null

type Props = {
  src: string
  poster?: string
  className?: string
  onDoubleTap?: () => void
  onSwipe?: (direction: "next" | "previous") => void
}

const DOUBLE_TAP_MS = 280
const SWIPE_THRESHOLD = 35

/**
 * Vídeo autocontenido para el feed. No usa los controles nativos porque su
 * botón gigante y su barra no pertenecen a la interfaz editorial del feed.
 */
export function FeedVideo({ src, poster, className = "", onDoubleTap, onSwipe }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pointersRef = useRef(new Map<number, PinchPoint>())
  const startXRef = useRef<number | null>(null)
  const initialDistanceRef = useRef(0)
  const initialMidpointRef = useRef<PinchPoint | null>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const isPinchingRef = useRef(false)
  const restoreTimerRef = useRef<number | null>(null)
  const lastTapRef = useRef(0)
  const lastPointerTypeRef = useRef<string | null>(null)
  const suppressTapRef = useRef(false)
  const [muted, setMuted] = useState(true)
  const [pinching, setPinching] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const frame = frameRef.current
    if (!video || !frame) return

    const pause = () => {
      video.pause()
      if (activeVideo === video) activeVideo = null
    }
    const play = () => {
      if (document.visibilityState !== "visible") return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      if (activeVideo && activeVideo !== video) activeVideo.pause()
      activeVideo = video
      video.muted = muted
      void video.play().catch(() => {
        if (activeVideo === video) activeVideo = null
      })
    }
    const desktopQuery = window.matchMedia("(min-width: 768px)")
    let isVisibleEnough = false
    const syncPlayback = () => {
      // El mosaico de ordenador presenta portadas quietas; la persona elige
      // qué vídeo ver con un clic. En móvil sí se conserva el autoplay al 30%.
      if (!desktopQuery.matches && isVisibleEnough) play()
      else pause()
    }
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleEnough = entry.intersectionRatio >= 0.3
      syncPlayback()
    }, { threshold: [0, 0.3] })
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") pause()
    }

    observer.observe(frame)
    desktopQuery.addEventListener("change", syncPlayback)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      observer.disconnect()
      desktopQuery.removeEventListener("change", syncPlayback)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      pause()
    }
  }, [muted, src])

  function toggleAudio() {
    const video = videoRef.current
    if (!video) return
    const nextMuted = !muted
    video.muted = nextMuted
    setMuted(nextMuted)
    if (!nextMuted) {
      if (activeVideo && activeVideo !== video) activeVideo.muted = true
      activeVideo = video
      void video.play().catch(() => undefined)
    }
  }

  function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    if (!video.paused && !video.ended) {
      video.pause()
      if (activeVideo === video) activeVideo = null
      return
    }
    if (activeVideo && activeVideo !== video) activeVideo.pause()
    activeVideo = video
    video.muted = muted
    void video.play().catch(() => {
      if (activeVideo === video) activeVideo = null
    })
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    lastPointerTypeRef.current = event.pointerType
    if (event.pointerType !== "touch") return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointersRef.current.size === 1) startXRef.current = event.clientX
    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()]
      initialDistanceRef.current = pinchDistance(first, second)
      if (initialDistanceRef.current > 0) {
        const video = videoRef.current
        if (!video) return
        if (restoreTimerRef.current) window.clearTimeout(restoreTimerRef.current)
        initialMidpointRef.current = pinchMidpoint(first, second)
        rectRef.current = video.getBoundingClientRect()
        isPinchingRef.current = true
        suppressTapRef.current = true
        setPinching(true)
        for (const pointerId of pointersRef.current.keys()) {
          event.currentTarget.setPointerCapture(pointerId)
        }
      }
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (!isPinchingRef.current || pointersRef.current.size < 2) return
    const [first, second] = [...pointersRef.current.values()]
    const midpoint = initialMidpointRef.current
    const rect = rectRef.current
    const video = videoRef.current
    if (!midpoint || !rect || !video) return
    event.preventDefault()
    const visual = pinchTransform(
      rect,
      midpoint,
      pinchMidpoint(first, second),
      initialDistanceRef.current,
      pinchDistance(first, second),
    )
    video.style.transform = `translate3d(${visual.x}px, ${visual.y}px, 0) scale(${visual.scale})`
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId)
    if (isPinchingRef.current && pointersRef.current.size < 2) {
      const video = videoRef.current
      isPinchingRef.current = false
      initialDistanceRef.current = 0
      initialMidpointRef.current = null
      rectRef.current = null
      if (video) {
        video.style.transition = "transform 200ms ease"
        video.style.transform = "translate3d(0, 0, 0) scale(1)"
      }
      setPinching(false)
      restoreTimerRef.current = window.setTimeout(() => {
        if (video) video.style.transition = ""
        suppressTapRef.current = false
      }, 220)
      return
    }
    if (!isPinchingRef.current && startXRef.current !== null) {
      const delta = startXRef.current - event.clientX
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        suppressTapRef.current = true
        onSwipe?.(delta > 0 ? "next" : "previous")
        window.setTimeout(() => { suppressTapRef.current = false }, 220)
      }
    }
    startXRef.current = null
  }

  useEffect(() => () => {
    if (restoreTimerRef.current) window.clearTimeout(restoreTimerRef.current)
  }, [])

  function handleClick() {
    if (suppressTapRef.current) return
    if (lastPointerTypeRef.current === "mouse") {
      togglePlayback()
      return
    }
    const now = Date.now()
    if (now - lastTapRef.current <= DOUBLE_TAP_MS) {
      lastTapRef.current = 0
      onDoubleTap?.()
      return
    }
    lastTapRef.current = now
  }

  return (
    <div
      ref={frameRef}
      className="relative h-full w-full overflow-hidden bg-gray-200 touch-pan-y"
      style={{ touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className={`${className} ${pinching ? "will-change-transform" : ""}`}
        style={{ transform: "translate3d(0, 0, 0) scale(1)", transformOrigin: "0 0" }}
      />

      <button
        type="button"
        aria-label={muted ? "Activar sonido" : "Silenciar vídeo"}
        aria-pressed={!muted}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => { event.stopPropagation(); toggleAudio() }}
        className="absolute bottom-1.5 right-1.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/20 text-gray-300 transition-colors hover:bg-black/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <SoundIcon muted={muted} />
      </button>
    </div>
  )
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10v4h4l5 4V6l-5 4H4z" />
      {muted ? <path d="m17 9 4 6m0-6-4 6" /> : <path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7.5 7.5 0 0 1 0 10" />}
    </svg>
  )
}
