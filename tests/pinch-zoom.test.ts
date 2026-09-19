import assert from "node:assert/strict"
import test from "node:test"
import {
  pinchBackdropOpacity,
  pinchDistance,
  pinchMidpoint,
  pinchScale,
  pinchTranslation,
} from "../lib/pinch-zoom"

test("calcula la geometría del pinch", () => {
  assert.equal(pinchDistance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5)
  assert.deepEqual(pinchMidpoint({ x: 10, y: 4 }, { x: 14, y: 8 }), { x: 12, y: 6 })
  assert.equal(pinchScale(50, 75), 1.5)
  assert.equal(pinchScale(0, 75), 1)
  assert.deepEqual(pinchTranslation({ x: 12, y: 6 }, { x: 17, y: 2 }), { x: 5, y: -4 })
})

test("interpela el backdrop sólo después de un aumento perceptible", () => {
  assert.equal(pinchBackdropOpacity(1), 0)
  assert.equal(pinchBackdropOpacity(1.2), 0)
  assert.equal(pinchBackdropOpacity(3), 0.6)
  assert.equal(pinchBackdropOpacity(4), 0.6)
})
