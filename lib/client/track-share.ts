type ShareResult = { counted: boolean; sharesCount: number; reason?: string }

const pending = new Set<string>()

function shareSessionKey(workId: string) {
  return `designfolio:share:${workId}`
}

/** Registra una copia de enlace una sola vez por obra y sesión de navegador. */
export async function trackShare(workId: string): Promise<ShareResult | null> {
  const key = shareSessionKey(workId)
  if (sessionStorage.getItem(key) || pending.has(key)) return null

  pending.add(key)
  try {
    const response = await fetch(`/api/works/${encodeURIComponent(workId)}/share`, {
      method: "POST",
      keepalive: true,
    })
    if (!response.ok) return null
    const result = await response.json() as ShareResult
    if (result.counted || result.reason === "already_counted") sessionStorage.setItem(key, "1")
    return result
  } catch {
    return null
  } finally {
    pending.delete(key)
  }
}
