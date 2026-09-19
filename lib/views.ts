export const VIEW_ORIGINS = ["feed_expand", "detail_page", "desktop_overlay"] as const
export type ViewOrigin = (typeof VIEW_ORIGINS)[number]

export const VIEW_DEDUPLICATION_MS = 24 * 60 * 60 * 1000
export const DETAIL_VIEW_DELAY_MS = 3_000

export function isViewOrigin(value: unknown): value is ViewOrigin {
  return typeof value === "string" && (VIEW_ORIGINS as readonly string[]).includes(value)
}

export function viewSessionKey(workId: string): string {
  return `designfolio:view:${workId}`
}
