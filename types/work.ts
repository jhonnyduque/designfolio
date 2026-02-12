// types/work.ts

export interface WorkImage {
  url: string
  width: number
  height: number
  type: string
  order: number
}

export interface CreateWorkPayload {
  title: string
  description: string
  category: string
  tags: string[]
  images: WorkImage[]
}

/** Categorías disponibles en beta */
export const WORK_CATEGORIES = [
  "Branding",
  "Ilustración",
  "Tipografía",
  "Editorial",
  "Packaging",
  "UI/UX",
  "Fotografía",
  "Motion",
  "Otro",
] as const

export type WorkCategory = (typeof WORK_CATEGORIES)[number]

/** Límites del schema — alineados con CHECK constraints en works table */
export const WORK_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 150,
  DESCRIPTION_MIN: 120,
  TAGS_MAX: 8,
  IMAGES_MIN: 1,
  IMAGES_MAX: 6,
  IMAGE_MAX_SIZE_MB: 5,
  IMAGE_MAX_SIZE_BYTES: 5 * 1024 * 1024,
} as const
