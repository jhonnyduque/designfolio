export const COOKIE_CONSENT_NAME = "df_cookie_consent"
export const ANALYTICS_CONSENT_VALUE = "analytics-v1"

export type CookieConsent = "unknown" | "accepted" | "rejected"

export function readCookieConsent(value: string | undefined): CookieConsent {
  if (value === ANALYTICS_CONSENT_VALUE) return "accepted"
  if (value === "essential-v1") return "rejected"
  return "unknown"
}

export function hasAnalyticsConsent(value: string | undefined): boolean {
  return readCookieConsent(value) === "accepted"
}
