"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { pinchDistance, type PinchPoint } from "@/lib/pinch-zoom"

let activeVideo: HTMLVideoElement | null = null

type Props = {
  src: string
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
export function FeedVideo({ src, className = "", onDoubleTap, onSwipe }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pointersRef = useRef(new Map<number, PinchPoint>())
  const startXRef = useRef<number | null>(null)
  const initialDistanceRef = useRef(0)
  const lastTapRef = useRef(0)
  const suppressTapRef = useRef(false)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [scale, setScale] = useState(1)
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
      video.muted = muted
      void video.play().then(() => { activeVideo = video }).catch(() => undefined)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.3) play()
      else if (!entry.isIntersecting || entry.intersectionRatio === 0) pause()
    }, { threshold: [0, 0.3] })
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") pause()
    }

    observer.observe(frame)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      observer.disconnect()
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

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointersRef.current.size === 1) startXRef.current = event.clientX
    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()]
      initialDistanceRef.current = pinchDistance(first, second)
      if (initialDistanceRef.current > 0) {
        suppressTapRef.current = true
        setPinching(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (!pinching || pointersRef.current.size < 2) return
    const [first, second] = [...pointersRef.current.values()]
    event.preventDefault()
    setScale(Math.min(3, Math.max(1, pinchDistance(first, second) / initialDistanceRef.current)))
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId)
    if (pinching && pointersRef.current.size < 2) {
      setScale(1)
      setPinching(false)
      window.setTimeout(() => { suppressTapRef.current = false }, 220)
      return
    }
    if (!pinching && startXRef.current !== null) {
      const delta = startXRef.current - event.clientX
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        suppressTapRef.current = true
        onSwipe?.(delta > 0 ? "next" : "previous")
        window.setTimeout(() => { suppressTapRef.current = false }, 220)
      }
    }
    startXRef.current = null
  }

  function handleClick() {
    if (suppressTapRef.current) return
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
      className="relative h-full w-full overflow-hidden bg-gray-900 touch-pan-y"
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
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={`${className} transition-transform duration-200 ${pinching ? "will-change-transform" : ""}`}
        style={{ transform: `scale(${scale})` }}
      />

      <button
        type="button"
        aria-label={muted ? "Activar sonido" : "Silenciar vídeo"}
        aria-pressed={!muted}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => { event.stopPropagation(); toggleAudio() }}
        className="absolute bottom-1.5 right-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/20 text-gray-300 transition-colors hover:bg-black/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <SoundIcon muted={muted} />
      </button>

      {!playing && (
        <button
          type="button"
          aria-label="Reproducir vídeo"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => { event.stopPropagation(); void videoRef.current?.play() }}
          className="absolute bottom-1.5 left-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/20 text-white transition-colors hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </button>
      )}
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
