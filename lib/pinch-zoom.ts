export type PinchPoint = { x: number; y: number }

export function pinchDistance(a: PinchPoint, b: PinchPoint) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function pinchMidpoint(a: PinchPoint, b: PinchPoint): PinchPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function pinchScale(initialDistance: number, currentDistance: number) {
  return initialDistance > 0 ? currentDistance / initialDistance : 1
}

export function pinchTranslation(initialMidpoint: PinchPoint, currentMidpoint: PinchPoint): PinchPoint {
  return { x: currentMidpoint.x - initialMidpoint.x, y: currentMidpoint.y - initialMidpoint.y }
}

export function pinchBackdropOpacity(scale: number) {
  // 1.2 → 0 y 3 → 0.6 son referencias de una réplica pública, no constantes de Instagram.
  return Math.max(0, Math.min(1, (scale - 1.2) / 1.8)) * 0.6
}
