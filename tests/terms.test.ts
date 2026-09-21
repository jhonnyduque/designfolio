import assert from "node:assert/strict"
import test from "node:test"
import {
  readTermsAcceptance,
  TERMS_COOKIE_NAME,
  TERMS_HEADER,
  TERMS_VERSION,
} from "../lib/terms"

test("acepta la versión vigente enviada por cabecera", () => {
  const headers = new Headers({ [TERMS_HEADER]: TERMS_VERSION })
  assert.equal(readTermsAcceptance(headers), TERMS_VERSION)
})

test("acepta la versión vigente conservada durante el flujo de Google", () => {
  const headers = new Headers({
    cookie: `otra=1; ${TERMS_COOKIE_NAME}=${TERMS_VERSION}`,
  })

  assert.equal(readTermsAcceptance(headers), TERMS_VERSION)
})

test("rechaza una aceptación ausente o de otra versión", () => {
  assert.equal(readTermsAcceptance(new Headers()), null)

  assert.equal(
    readTermsAcceptance(
      new Headers({ [TERMS_HEADER]: "2026-01-01" }),
    ),
    null,
  )

  assert.equal(
    readTermsAcceptance(
      new Headers({
        cookie: `${TERMS_COOKIE_NAME}=2026-01-01`,
      }),
    ),
    null,
  )
})