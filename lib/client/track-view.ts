import type { ViewOrigin } from "@/lib/views"
import { viewSessionKey } from "@/lib/views"

export type ViewResult = {
  counted: boolean
  viewsCount: number
  reason?: "already_counted" | "consent_required" | "own_work"
}

const pending = new Set<string>()

export async function trackView(workId: string, origin: ViewOrigin): Promise<ViewResult | null> {
  const key = viewSessionKey(workId)
  if (sessionStorage.getItem(key) || pending.has(key)) return null

  pending.add(key)
  try {
    const response = await fetch(`/api/works/${workId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin }),
      keepalive: true,
    })
    if (!response.ok) return null
    const result = await response.json() as ViewResult
    if (result.counted || result.reason === "already_counted" || result.reason === "own_work") {
      sessionStorage.setItem(key, "1")
    }
    return result
  } catch {
    return null
  } finally {
    pending.delete(key)
  }
}
