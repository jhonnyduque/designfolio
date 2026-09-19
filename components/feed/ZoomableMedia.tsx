"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState, type PointerEvent } from "react"

const MAX_SCALE = 2
const SWIPE_THRESHOLD = 35
const DOUBLE_TAP_DELAY = 280
const RESTORE_DELAY = 700

type Props = {
  href: string
  src: string
  alt: string
  className?: string
  onSwipe?: (direction: "next" | "previous") => void
}

function distance(a: PointerEvent<HTMLDivElement>, b: PointerEvent<HTMLDivElement>) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

export function ZoomableMedia({ href, src, alt, className = "", onSwipe }: Props) {
  const [scale, setScale] = useState(1)
  const pointers = useRef(new Map<number, PointerEvent<HTMLDivElement>>())
  const gestureRef = useRef(false)
  const startX = useRef<number | null>(null)
  const lastTap = useRef(0)
  const initialDistance = useRef<number | null>(null)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  function scheduleRestore() {
    if (restoreTimer.current) clearTimeout(restoreTimer.current)
    restoreTimer.current = setTimeout(() => {
      setScale(1)
      gestureRef.current = false
    }, RESTORE_DELAY)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    pointers.current.set(event.pointerId, event)
    event.currentTarget.setPointerCapture(event.pointerId)

    if (pointers.current.size === 2) {
      gestureRef.current = true
      startX.current = null
      const activePointers = [...pointers.current.values()]
      initialDistance.current = distance(activePointers[0], activePointers[1])
      return
    }

    if (scale === 1) startX.current = event.clientX
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    pointers.current.set(event.pointerId, event)
    const activePointers = [...pointers.current.values()]

    if (activePointers.length >= 2) {
      event.preventDefault()
      gestureRef.current = true
      const baseDistance = initialDistance.current ?? distance(activePointers[0], activePointers[1])
      const nextScale = Math.min(MAX_SCALE, Math.max(1, (scale * distance(activePointers[0], activePointers[1])) / baseDistance))
      setScale((current) => Math.max(current, nextScale))
      return
    }

    if (scale > 1) {
      event.preventDefault()
      gestureRef.current = true
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId)

    if (pointers.current.size > 0) {
      scheduleRestore()
      return
    }

    initialDistance.current = null

    if (scale > 1 || gestureRef.current) {
      scheduleRestore()
      startX.current = null
      return
    }

    if (startX.current !== null) {
      const deltaX = startX.current - event.clientX
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && onSwipe) {
        gestureRef.current = true
        onSwipe(deltaX > 0 ? "next" : "previous")
        startX.current = null
        return
      }
    }

    const now = Date.now()
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if (clickTimer.current) clearTimeout(clickTimer.current)
      gestureRef.current = true
      setScale(MAX_SCALE)
      scheduleRestore()
    }
    lastTap.current = now
    startX.current = null
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size === 0) {
      initialDistance.current = null
      setScale(1)
      gestureRef.current = false
      startX.current = null
    }
  }

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (gestureRef.current) return
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => router.push(href), DOUBLE_TAP_DELAY)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="block h-full w-full overflow-hidden"
    >
      <div
        className="h-full w-full touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: "pan-y" }}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          className={className}
          style={{
            transform: `scale(${scale})`,
            transition: scale === 1 ? "transform 180ms ease-out" : "none",
          }}
        />
      </div>
    </Link>
  )
}
