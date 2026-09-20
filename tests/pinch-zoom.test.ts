import assert from "node:assert/strict"
import test from "node:test"
import {
  pinchDistance,
  pinchMidpoint,
  pinchScale,
  pinchTransform,
} from "../lib/pinch-zoom"

test("calcula la geometría del pinch", () => {
  assert.equal(pinchDistance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5)
  assert.deepEqual(pinchMidpoint({ x: 10, y: 4 }, { x: 14, y: 8 }), { x: 12, y: 6 })
  assert.equal(pinchScale(50, 75), 1.5)
  assert.equal(pinchScale(0, 75), 1)
  assert.equal(pinchScale(50, 25), 1)
})

test("mantiene el rectángulo original hasta que existe zoom efectivo", () => {
  const rect = { left: 20, top: 40 }
  const start = { x: 70, y: 90 }
  assert.deepEqual(pinchTransform(rect, start, start, 100, 100), { scale: 1, x: 0, y: 0 })
  assert.deepEqual(pinchTransform(rect, start, { x: 120, y: 140 }, 100, 50), { scale: 1, x: 0, y: 0 })
})

test("mantiene el punto focal bajo el midpoint al ampliar", () => {
  assert.deepEqual(
    pinchTransform({ left: 20, top: 40 }, { x: 70, y: 90 }, { x: 90, y: 110 }, 100, 200),
    { scale: 2, x: -30, y: -30 },
  )
})
