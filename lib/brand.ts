/**
 * Tokens de marca para contextos donde no se puede usar CSS.
 *
 * Los correos no leen `globals.css`, así que los valores viven aquí duplicados
 * a propósito. Si cambian en `app/globals.css`, hay que actualizarlos también
 * en este archivo.
 */
export const BRAND = {
  /** --background */
  background: "#f5f7f5",
  /** --foreground */
  foreground: "#1e1e1e",
  /** --surface */
  surface: "#ffffff",
  /** --muted */
  muted: "#5d5d63",
  /** --border */
  border: "#e3e5e8",
  /** --accent: el negro de los botones principales */
  accent: "#111111",
  /** El vino profundo del panel de autenticación, usado como acento cálido. */
  accentDeep: "#831843",

  siteUrl: "https://designfolio.jhonnyduque.com",
  siteHost: "designfolio.jhonnyduque.com",
} as const
