import assert from "node:assert/strict"
import test from "node:test"
import { mediaAspectRatio } from "../lib/media-aspect"

test("preserva la proporción vertical 1080×1920", () => {
  assert.equal(mediaAspectRatio(1080, 1920), "1080 / 1920")
})

test("conserva las proporciones válidas y protege medios incompletos", () => {
  assert.equal(mediaAspectRatio(1920, 1080), "1920 / 1080")
  assert.equal(mediaAspectRatio(0, 1080), "4 / 5")
  assert.equal(mediaAspectRatio(undefined, undefined), "4 / 5")
})
