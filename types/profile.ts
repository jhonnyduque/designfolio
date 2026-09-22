// types/profile.ts

export interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  /** Campos heredados: permanecen en BD por compatibilidad, pero ya no forman parte del perfil público. */
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
}

export const PROFILE_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 24,
  BIO_MAX: 220,
  AVATAR_MAX_SIZE_MB: 2,
  AVATAR_MAX_SIZE_BYTES: 2 * 1024 * 1024,
} as const
