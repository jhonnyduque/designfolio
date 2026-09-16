import { boolean, check, index, int, json, mysqlEnum, mysqlTable, text, timestamp as mysqlTimestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"
import type { WorkImage } from "@/types/work"

const id = (name: string) => varchar(name, { length: 36 })
const timestamp = (name: string) => mysqlTimestamp(name, { mode: "date", fsp: 3 })

export const profiles = mysqlTable("profiles", {
  id: id("id").primaryKey(),
  username: varchar("username", { length: 30 }).notNull(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  avatarUrl: text("avatar_url"),
  bio: varchar("bio", { length: 220 }),
  school: varchar("school", { length: 150 }),
  careerYear: varchar("career_year", { length: 50 }),
  categories: json("categories").$type<string[]>(),
  themeColor: varchar("theme_color", { length: 20 }).notNull().default("#111827"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  isFounder: boolean("is_founder").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  reputationLevel: int("reputation_level").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [uniqueIndex("profiles_username_key").on(table.username)])

export const works = mysqlTable("works", {
  id: id("id").primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull(),
  authorId: id("author_id").notNull().references(() => profiles.id, { onDelete: "restrict" }),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  tags: json("tags").$type<string[]>(),
  images: json("images").$type<WorkImage[]>().notNull(),
  moderationStatus: mysqlEnum("moderation_status", ["draft", "pending_review", "approved", "rejected"]).notNull().default("draft"),
  viewsCount: int("views_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
  archivedAt: timestamp("archived_at"),
}, (table) => [
  uniqueIndex("works_slug_key").on(table.slug),
  index("works_author_created_idx").on(table.authorId, table.createdAt),
  index("works_status_published_idx").on(table.moderationStatus, table.publishedAt),
])

export const likes = mysqlTable("likes", {
  id: id("id").primaryKey(),
  workId: id("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  userId: id("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  visitorId: varchar("visitor_id", { length: 80 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("likes_work_idx").on(table.workId),
  uniqueIndex("likes_user_unique").on(table.workId, table.userId),
  uniqueIndex("likes_visitor_unique").on(table.workId, table.visitorId),
  check("likes_actor_check", sql`(${table.userId} is null) <> (${table.visitorId} is null)`),
])

export const comments = mysqlTable("comments", {
  id: id("id").primaryKey(),
  workId: id("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  userId: id("user_id").references(() => profiles.id, { onDelete: "set null" }),
  visitorId: varchar("visitor_id", { length: 80 }),
  visitorName: varchar("visitor_name", { length: 80 }),
  content: text("content").notNull(),
  categories: json("categories").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("comments_work_created_idx").on(table.workId, table.createdAt)])

export const notifications = mysqlTable("notifications", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["like", "comment", "work_approved", "work_rejected"]).notNull(),
  targetId: id("target_id"),
  payload: json("payload").$type<Record<string, unknown>>().notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("notifications_user_created_idx").on(table.userId, table.createdAt)])

export const invitationCodes = mysqlTable("invitation_codes", {
  id: id("id").primaryKey(),
  codeHash: varchar("code_hash", { length: 64 }).notNull(),
  createdBy: id("created_by").notNull().references(() => profiles.id, { onDelete: "restrict" }),
  usedBy: id("used_by").references(() => profiles.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [uniqueIndex("invitation_code_hash_key").on(table.codeHash)])

export const taxonomy = mysqlTable("taxonomy", {
  id: id("id").primaryKey(),
  kind: mysqlEnum("kind", ["category", "tag"]).notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  archivedAt: timestamp("archived_at"),
}, (table) => [uniqueIndex("taxonomy_kind_slug_key").on(table.kind, table.slug)])

export const moderationLog = mysqlTable("moderation_log", {
  id: id("id").primaryKey(),
  workId: id("work_id").notNull().references(() => works.id, { onDelete: "cascade" }),
  actorId: id("actor_id").notNull().references(() => profiles.id, { onDelete: "restrict" }),
  action: mysqlEnum("action", ["approve", "reject", "archive", "delete"]).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("moderation_log_work_idx").on(table.workId)])
