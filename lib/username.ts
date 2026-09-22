import { PROFILE_LIMITS } from "@/types/profile"

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "api",
  "auth",
  "dashboard",
  "designfolio",
  "feed",
  "legal",
  "login",
  "moderador",
  "moderation",
  "new",
  "onboarding",
  "profile",
  "proyectos",
  "register",
  "root",
  "settings",
  "soporte",
  "support",
])

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

export function sanitizeUsernameInput(value: string) {
  return normalizeUsername(value).replace(/[^a-z0-9_]/g, "")
}

export function usernameValidationError(value: string): string | null {
  const username = normalizeUsername(value)

  if (
    username.length < PROFILE_LIMITS.USERNAME_MIN ||
    username.length > PROFILE_LIMITS.USERNAME_MAX
  ) {
    return `El nombre de usuario debe tener entre ${PROFILE_LIMITS.USERNAME_MIN} y ${PROFILE_LIMITS.USERNAME_MAX} caracteres.`
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return "Usa solo letras minúsculas, números y guion bajo (_)."
  }

  if (RESERVED_USERNAMES.has(username)) {
    return "Ese nombre de usuario está reservado."
  }

  return null
}
