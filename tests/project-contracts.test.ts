import assert from "node:assert/strict"
import test from "node:test"
import { toLegacyWorkDetailData } from "../lib/works/detail-adapter"
import type { PublicProjectDetail } from "../types/project"

const publicDetail: PublicProjectDetail = {
  project: {
    id: "work-1",
    slug: "obra-publica",
    title: "Obra pública",
    description: "Descripción",
    category: "Editorial",
    tags: ["impreso"],
    media: [{ url: "/obra.jpg", width: 1200, height: 800, type: "image/jpeg", order: 0 }],
    createdAt: "2026-09-20T10:00:00.000Z",
    publishedAt: "2026-09-20T10:00:00.000Z",
  },
  author: {
    id: "author-1",
    username: "autora",
    fullName: "Autora Pública",
    avatarUrl: null,
    reputationLevel: 2,
    bio: "Bio pública",
    school: "Escuela",
  },
  metrics: { likesCount: 4, commentsCount: 2, viewsCount: 8, sharesCount: 1 },
  navigation: { previous: null, next: null },
}

test("adapta el contrato público al renderer heredado sin añadir datos protegidos", () => {
  const result = toLegacyWorkDetailData(publicDetail)

  assert.deepEqual(result.work, {
    id: "work-1",
    slug: "obra-publica",
    title: "Obra pública",
    description: "Descripción",
    category: "Editorial",
    tags: ["impreso"],
    images: publicDetail.project.media,
    likes_count: 4,
    comments_count: 2,
    views_count: 8,
    shares_count: 1,
    published_at: "2026-09-20T10:00:00.000Z",
  })
  assert.equal(result.author.full_name, "Autora Pública")
})
