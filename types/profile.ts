// types/profile.ts

export interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  school: string | null
  career_year: string | null
  categories: string[] | null
  theme_color: string
  onboarding_completed: boolean
}

export interface OnboardingPayload {
  username: string
  full_name: string
  avatar_url: string | null
  bio: string
  school: string
  career_year: string
  categories: string[]
}

/** Categorías de diseño para el perfil */
export const PROFILE_CATEGORIES = [
  "Branding",
  "Ilustración",
  "Tipografía",
  "Editorial",
  "Packaging",
  "UI/UX",
  "Fotografía",
  "Motion",
  "3D",
  "Dirección de Arte",
] as const

/** Años de carrera */
export const CAREER_YEARS = [
  "1er año",
  "2do año",
  "3er año",
  "4to año",
  "5to año",
  "Egresado",
  "Autodidacta",
] as const

/** Límites alineados con CHECK constraints en profiles */
export const PROFILE_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  BIO_MIN: 80,
  BIO_MAX: 220,
  CATEGORIES_MIN: 1,
  CATEGORIES_MAX: 2,
  AVATAR_MAX_SIZE_MB: 2,
  AVATAR_MAX_SIZE_BYTES: 2 * 1024 * 1024,
} as const
