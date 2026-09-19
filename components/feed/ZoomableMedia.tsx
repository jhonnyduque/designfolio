"use client"

import Link from "next/link"
import { createPortal } from "react-dom"
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react"
import { pinchBackdropOpacity, pinchDistance, pinchMidpoint, pinchScale, pinchTranslation, type PinchPoint } from "@/lib/pinch-zoom"

const SWIPE_THRESHOLD = 35
const SNAP_BACK_MS = 200

type Overlay = { src: string; rect: DOMRect; origin: PinchPoint }

type Props = {
  href: string
  src: string
  alt: string
  className?: string
  onSwipe?: (direction: "next" | "previous") => void
  enablePinch?: boolean
}

function pointFrom(event: PointerEvent<HTMLDivElement>): PinchPoint {
  return { x: event.clientX, y: event.clientY }
}

export function ZoomableMedia({ href, src, alt, className = "", onSwipe, enablePinch = false }: Props) {
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const overlayImageRef = useRef<HTMLImageElement | null>(null)
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const pointersRef = useRef(new Map<number, PinchPoint>())
  const pinchPointerIdsRef = useRef<[number, number] | null>(null)
  const initialDistanceRef = useRef(0)
  const initialMidpointRef = useRef<PinchPoint | null>(null)
  const visualRef = useRef({ scale: 1, x: 0, y: 0 })
  const isPinchingRef = useRef(false)
  const isRestoringRef = useRef(false)
  const didPinchRef = useRef(false)
  const startXRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const capturedPointersRef = useRef(new Set<number>())
  const clearGestureRef = useRef<(target: HTMLDivElement | null, immediately?: boolean) => void>(() => {})
  const visibilityListener = useRef(() => {
    if (document.visibilityState !== "visible") clearGestureRef.current(null, true)
  }).current

  useLayoutEffect(() => {
    if (!overlay) return
    const original = imageRef.current
    if (original) original.style.opacity = "0"
    return () => { if (original) original.style.opacity = "" }
  }, [overlay])

  function removeTemporaryListeners() {
    document.removeEventListener("visibilitychange", visibilityListener)
  }

  function releaseCapturedPointers(target: HTMLDivElement | null) {
    const surface = target ?? surfaceRef.current
    if (surface) {
      for (const pointerId of capturedPointersRef.current) {
        if (surface.hasPointerCapture(pointerId)) surface.releasePointerCapture(pointerId)
      }
    }
    capturedPointersRef.current.clear()
  }

  function cancelVisualFrame() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function applyVisual() {
    rafRef.current = null
    const image = overlayImageRef.current
    const backdrop = backdropRef.current
    if (!image || !backdrop) return
    const { scale, x, y } = visualRef.current
    image.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
    backdrop.style.opacity = String(pinchBackdropOpacity(scale))
  }

  function queueVisualUpdate() {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(applyVisual)
  }

  function clearGesture(target: HTMLDivElement | null, immediately = false) {
    cancelVisualFrame()
    if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current)
    restoreTimerRef.current = null
    releaseCapturedPointers(target)
    removeTemporaryListeners()
    pointersRef.current.clear()
    pinchPointerIdsRef.current = null
    initialDistanceRef.current = 0
    initialMidpointRef.current = null
    startXRef.current = null
    visualRef.current = { scale: 1, x: 0, y: 0 }
    isPinchingRef.current = false
    isRestoringRef.current = false
    if (immediately) setOverlay(null)
  }

  useEffect(() => {
    clearGestureRef.current = clearGesture
  })

  function resetPinchClick() {
    if (clickResetTimerRef.current) clearTimeout(clickResetTimerRef.current)
    clickResetTimerRef.current = setTimeout(() => { didPinchRef.current = false }, SNAP_BACK_MS + 100)
  }

  function finishRestore(target: HTMLDivElement | null) {
    clearGesture(target, true)
  }

  function startRestore(target: HTMLDivElement | null) {
    if (!isPinchingRef.current || isRestoringRef.current) return
    isRestoringRef.current = true
    isPinchingRef.current = false
    resetPinchClick()
    cancelVisualFrame()
    releaseCapturedPointers(target)
    removeTemporaryListeners()
    pointersRef.current.clear()
    pinchPointerIdsRef.current = null

    const image = overlayImageRef.current
    const backdrop = backdropRef.current
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!image || !backdrop || reducedMotion) {
      finishRestore(target)
      return
    }

    image.style.transition = `transform ${SNAP_BACK_MS}ms ease`
    backdrop.style.transition = `opacity ${SNAP_BACK_MS}ms ease`
    visualRef.current = { scale: 1, x: 0, y: 0 }
    image.style.transform = "translate3d(0, 0, 0) scale(1)"
    backdrop.style.opacity = "0"
    restoreTimerRef.current = setTimeout(() => finishRestore(target), SNAP_BACK_MS)
  }

  function beginPinch(target: HTMLDivElement) {
    const pointerIds = [...pointersRef.current.keys()].slice(0, 2) as [number, number]
    const first = pointersRef.current.get(pointerIds[0])
    const second = pointersRef.current.get(pointerIds[1])
    const original = imageRef.current
    if (!first || !second || !original) return

    const initialDistance = pinchDistance(first, second)
    if (initialDistance === 0) return

    const rect = original.getBoundingClientRect()
    const midpoint = pinchMidpoint(first, second)
    initialDistanceRef.current = initialDistance
    initialMidpointRef.current = midpoint
    pinchPointerIdsRef.current = pointerIds
    visualRef.current = { scale: 1, x: 0, y: 0 }
    isPinchingRef.current = true
    didPinchRef.current = true
    startXRef.current = null
    for (const pointerId of pointerIds) {
      target.setPointerCapture(pointerId)
      capturedPointersRef.current.add(pointerId)
    }
    document.addEventListener("visibilitychange", visibilityListener)

    // El portal evita escalar el post y permite que la foto salga de su contenedor sin reflow.
    setOverlay({ src: original.currentSrc || src, rect, origin: { x: midpoint.x - rect.left, y: midpoint.y - rect.top } })
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!enablePinch || event.pointerType !== "touch") return
    pointersRef.current.set(event.pointerId, pointFrom(event))
    if (pointersRef.current.size === 1) {
      startXRef.current = event.clientX
      return
    }
    if (pointersRef.current.size === 2 && !isPinchingRef.current) beginPinch(event.currentTarget)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!enablePinch || event.pointerType !== "touch") return
    pointersRef.current.set(event.pointerId, pointFrom(event))
    if (!isPinchingRef.current) return
    const pointerIds = pinchPointerIdsRef.current
    const initialMidpoint = initialMidpointRef.current
    if (!pointerIds || !initialMidpoint) return
    const first = pointersRef.current.get(pointerIds[0])
    const second = pointersRef.current.get(pointerIds[1])
    if (!first || !second) return

    event.preventDefault()
    const midpoint = pinchMidpoint(first, second)
    const translation = pinchTranslation(initialMidpoint, midpoint)
    visualRef.current = {
      scale: pinchScale(initialDistanceRef.current, pinchDistance(first, second)),
      x: translation.x,
      y: translation.y,
    }
    queueVisualUpdate()
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId)
    const pinchPointerIds = pinchPointerIdsRef.current
    if (isPinchingRef.current && pinchPointerIds?.includes(event.pointerId)) {
      startRestore(event.currentTarget)
      return
    }
    if (isPinchingRef.current) return
    if (startXRef.current !== null) {
      const deltaX = startXRef.current - event.clientX
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && onSwipe) onSwipe(deltaX > 0 ? "next" : "previous")
    }
    startXRef.current = null
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    clearGesture(event.currentTarget, true)
    didPinchRef.current = false
  }

  function handleLostPointerCapture(event: PointerEvent<HTMLDivElement>) {
    if (isPinchingRef.current && !isRestoringRef.current) clearGesture(event.currentTarget, true)
  }

  function handleClickCapture(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!didPinchRef.current) return
    event.preventDefault()
    event.stopPropagation()
    didPinchRef.current = false
    if (clickResetTimerRef.current) clearTimeout(clickResetTimerRef.current)
  }

  useEffect(() => () => {
    clearGestureRef.current(null, true)
    if (clickResetTimerRef.current) clearTimeout(clickResetTimerRef.current)
  }, [])

  return (
    <>
      <Link href={href} onClickCapture={handleClickCapture} className="block h-full w-full overflow-hidden">
        <div
          ref={surfaceRef}
          className="h-full w-full touch-pan-y"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handleLostPointerCapture}
          style={{ touchAction: "pan-y" }}
        >
          <img ref={imageRef} src={src} alt={alt} loading="lazy" draggable={false} className={className} />
        </div>
      </Link>

      {overlay && typeof document !== "undefined" && createPortal(
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
          <div ref={backdropRef} className="absolute inset-0 bg-black" />
          <img
            ref={overlayImageRef}
            src={overlay.src}
            alt=""
            draggable={false}
            className={`pointer-events-none fixed z-[81] ${className}`}
            style={{
              left: overlay.rect.left,
              top: overlay.rect.top,
              width: overlay.rect.width,
              height: overlay.rect.height,
              transform: "translate3d(0, 0, 0) scale(1)",
              transformOrigin: `${overlay.origin.x}px ${overlay.origin.y}px`,
              willChange: "transform",
            }}
          />
        </div>,
        document.body,
      )}
    </>
  )
}
