export type PinchPoint = { x: number; y: number }
export type PinchRect = { left: number; top: number }

export function pinchDistance(a: PinchPoint, b: PinchPoint) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function pinchMidpoint(a: PinchPoint, b: PinchPoint): PinchPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function pinchScale(initialDistance: number, currentDistance: number) {
  const rawScale = initialDistance > 0 ? currentDistance / initialDistance : 1
  return Math.max(1, rawScale)
}

export function pinchTransform(
  rect: PinchRect,
  initialMidpoint: PinchPoint,
  currentMidpoint: PinchPoint,
  initialDistance: number,
  currentDistance: number,
) {
  const scale = pinchScale(initialDistance, currentDistance)
  if (scale === 1) return { scale, x: 0, y: 0 }

  const focalX = initialMidpoint.x - rect.left
  const focalY = initialMidpoint.y - rect.top
  return {
    scale,
    x: currentMidpoint.x - rect.left - scale * focalX,
    y: currentMidpoint.y - rect.top - scale * focalY,
  }
}
