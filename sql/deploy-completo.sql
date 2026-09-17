-- ============================================================
-- Designfolio: esquema completo para una base MySQL nueva.
--
-- Importar UNA sola vez en phpMyAdmin, sobre la base vacia.
-- Incluye, en este orden:
--   1. Tablas de Better Auth (user, session, account, verification)
--   2. Tablas de la aplicacion (migraciones drizzle 0000-0003 ya consolidadas)
--   3. Claves foraneas y restricciones
--   4. Las 9 categorias iniciales, sin las cuales no se puede publicar
--   5. El registro de migraciones, para que drizzle-kit no reaplique nada
--
-- Generado el 2026-09-17 desde la rama codex/hostinger-mysql-migration.
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------- 1. Better Auth ----------

create table `user` (`id` varchar(36) not null primary key, `name` varchar(255) not null, `email` varchar(255) not null unique, `emailVerified` boolean not null, `image` text, `createdAt` timestamp(3) default CURRENT_TIMESTAMP(3) not null, `updatedAt` timestamp(3) default CURRENT_TIMESTAMP(3) not null);

create table `session` (`id` varchar(36) not null primary key, `expiresAt` timestamp(3) not null, `token` varchar(255) not null unique, `createdAt` timestamp(3) default CURRENT_TIMESTAMP(3) not null, `updatedAt` timestamp(3) not null, `ipAddress` text, `userAgent` text, `userId` varchar(36) not null references `user` (`id`) on delete cascade);

create table `account` (`id` varchar(36) not null primary key, `accountId` text not null, `providerId` text not null, `userId` varchar(36) not null references `user` (`id`) on delete cascade, `accessToken` text, `refreshToken` text, `idToken` text, `accessTokenExpiresAt` timestamp(3), `refreshTokenExpiresAt` timestamp(3), `scope` text, `password` text, `createdAt` timestamp(3) default CURRENT_TIMESTAMP(3) not null, `updatedAt` timestamp(3) not null);

create table `verification` (`id` varchar(36) not null primary key, `identifier` varchar(255) not null, `value` text not null, `expiresAt` timestamp(3) not null, `createdAt` timestamp(3) default CURRENT_TIMESTAMP(3) not null, `updatedAt` timestamp(3) default CURRENT_TIMESTAMP(3) not null);

create index `session_userId_idx` on `session` (`userId`);

create index `account_userId_idx` on `account` (`userId`);

create index `verification_identifier_idx` on `verification` (`identifier`);
-- ---------- 2 y 3. Aplicacion ----------

-- ===== 0000_shocking_madelyne_pryor.sql =====
CREATE TABLE `comments` (
	`id` varchar(36) NOT NULL,
	`work_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`visitor_id` varchar(80),
	`visitor_name` varchar(80),
	`content` text NOT NULL,
	`categories` json,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);

CREATE TABLE `invitation_codes` (
	`id` varchar(36) NOT NULL,
	`code_hash` varchar(64) NOT NULL,
	`created_by` varchar(36) NOT NULL,
	`used_by` varchar(36),
	`expires_at` timestamp(3),
	`used_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `invitation_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitation_code_hash_key` UNIQUE(`code_hash`)
);

CREATE TABLE `likes` (
	`id` varchar(36) NOT NULL,
	`work_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`visitor_id` varchar(80),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `likes_user_unique` UNIQUE(`work_id`,`user_id`),
	CONSTRAINT `likes_visitor_unique` UNIQUE(`work_id`,`visitor_id`)
);

CREATE TABLE `moderation_log` (
	`id` varchar(36) NOT NULL,
	`work_id` varchar(36) NOT NULL,
	`actor_id` varchar(36) NOT NULL,
	`action` enum('approve','reject','archive','delete') NOT NULL,
	`note` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `moderation_log_id` PRIMARY KEY(`id`)
);

CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` enum('like','comment','work_approved','work_rejected') NOT NULL,
	`target_id` varchar(36),
	`payload` json NOT NULL,
	`read_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);

CREATE TABLE `profiles` (
	`id` varchar(36) NOT NULL,
	`username` varchar(30) NOT NULL,
	`full_name` varchar(150) NOT NULL,
	`avatar_url` text,
	`bio` varchar(220),
	`school` varchar(150),
	`career_year` varchar(50),
	`categories` json,
	`theme_color` varchar(20) NOT NULL DEFAULT '#111827',
	`onboarding_completed` boolean NOT NULL DEFAULT false,
	`is_founder` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`reputation_level` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_username_key` UNIQUE(`username`)
);

CREATE TABLE `taxonomy` (
	`id` varchar(36) NOT NULL,
	`kind` enum('category','tag') NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`archived_at` timestamp(3),
	CONSTRAINT `taxonomy_id` PRIMARY KEY(`id`),
	CONSTRAINT `taxonomy_kind_slug_key` UNIQUE(`kind`,`slug`)
);

CREATE TABLE `works` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`author_id` varchar(36) NOT NULL,
	`title` varchar(150) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`tags` json,
	`images` json NOT NULL,
	`moderation_status` enum('draft','pending_review','approved','rejected') NOT NULL DEFAULT 'draft',
	`views_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`published_at` timestamp(3),
	`archived_at` timestamp(3),
	CONSTRAINT `works_id` PRIMARY KEY(`id`),
	CONSTRAINT `works_slug_key` UNIQUE(`slug`)
);

CREATE INDEX `comments_work_created_idx` ON `comments` (`work_id`,`created_at`);
CREATE INDEX `likes_work_idx` ON `likes` (`work_id`);
CREATE INDEX `moderation_log_work_idx` ON `moderation_log` (`work_id`);
CREATE INDEX `notifications_user_created_idx` ON `notifications` (`user_id`,`created_at`);
CREATE INDEX `works_author_created_idx` ON `works` (`author_id`,`created_at`);
CREATE INDEX `works_status_published_idx` ON `works` (`moderation_status`,`published_at`);
-- ===== 0001_whole_frog_thor.sql =====
ALTER TABLE `likes` ADD CONSTRAINT `likes_actor_check` CHECK ((`likes`.`user_id` is null) <> (`likes`.`visitor_id` is null));
ALTER TABLE `comments` ADD CONSTRAINT `comments_work_id_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `works`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_profiles_id_fk` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `invitation_codes` ADD CONSTRAINT `invitation_codes_created_by_profiles_id_fk` FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON DELETE restrict ON UPDATE no action;
ALTER TABLE `invitation_codes` ADD CONSTRAINT `invitation_codes_used_by_profiles_id_fk` FOREIGN KEY (`used_by`) REFERENCES `profiles`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `likes` ADD CONSTRAINT `likes_work_id_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `works`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `likes` ADD CONSTRAINT `likes_user_id_profiles_id_fk` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `moderation_log` ADD CONSTRAINT `moderation_log_work_id_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `works`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `moderation_log` ADD CONSTRAINT `moderation_log_actor_id_profiles_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `profiles`(`id`) ON DELETE restrict ON UPDATE no action;
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_profiles_id_fk` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `works` ADD CONSTRAINT `works_author_id_profiles_id_fk` FOREIGN KEY (`author_id`) REFERENCES `profiles`(`id`) ON DELETE restrict ON UPDATE no action;
-- ===== 0002_moderation_log_survives_delete.sql =====
ALTER TABLE `moderation_log` DROP FOREIGN KEY `moderation_log_work_id_works_id_fk`;

ALTER TABLE `moderation_log` MODIFY COLUMN `work_id` varchar(36);
ALTER TABLE `moderation_log` MODIFY COLUMN `action` enum('approve','reject','archive','restore','delete') NOT NULL;
ALTER TABLE `moderation_log` ADD `work_title` varchar(150) NOT NULL;
ALTER TABLE `moderation_log` ADD CONSTRAINT `moderation_log_work_id_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `works`(`id`) ON DELETE set null ON UPDATE no action;
-- ===== 0003_taxonomy_admin_fields.sql =====
ALTER TABLE `taxonomy` ADD `sort_order` int DEFAULT 0 NOT NULL;
ALTER TABLE `taxonomy` ADD `created_by` varchar(36);
ALTER TABLE `taxonomy` ADD `updated_at` timestamp(3) DEFAULT (now()) NOT NULL;
ALTER TABLE `taxonomy` ADD CONSTRAINT `taxonomy_created_by_profiles_id_fk` FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON DELETE set null ON UPDATE no action;
CREATE INDEX `taxonomy_kind_order_idx` ON `taxonomy` (`kind`,`sort_order`);

-- ---------- 4. Categorias iniciales ----------
-- Sin filas en `taxonomy` de tipo category, la API de creacion rechaza
-- cualquier publicacion. Equivale a ejecutar scripts/seed-taxonomy.ts.

INSERT INTO `taxonomy` (`id`, `kind`, `name`, `slug`, `active`, `sort_order`) VALUES
  (UUID(), 'category', 'Branding',    'branding',    1, 0),
  (UUID(), 'category', 'Ilustración', 'ilustracion', 1, 1),
  (UUID(), 'category', 'Tipografía',  'tipografia',  1, 2),
  (UUID(), 'category', 'Editorial',   'editorial',   1, 3),
  (UUID(), 'category', 'Packaging',   'packaging',   1, 4),
  (UUID(), 'category', 'UI/UX',       'ui-ux',       1, 5),
  (UUID(), 'category', 'Fotografía',  'fotografia',  1, 6),
  (UUID(), 'category', 'Motion',      'motion',      1, 7),
  (UUID(), 'category', 'Otro',        'otro',        1, 8);

-- ---------- 5. Registro de migraciones ----------
-- Marca las cuatro migraciones como ya aplicadas, para que un
-- `drizzle-kit migrate` posterior no intente recrear estas tablas.

CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES
  ('657f7af8a622f94e83700fe2fd933183ecb8a52a9a9c0e70a3f32c28c9e3bb52', 1789421236893),
  ('eab78f389814923ccdf6996a180e5ca42a6518836bab19bc8bdd0b183234d1fd', 1789422440941),
  ('e14a1b374e3ab18f9daab42d658ab4de77057bdc946ef72b06be321939c2eec3', 1789597428401),
  ('15eb03dead34647afa9fa1d200e61a2b711131041f239615769838496d8ac9c4', 1789597785909);

-- Fin. Verifica con:  SHOW TABLES;      -- deben aparecer 13
--                     SELECT COUNT(*) FROM taxonomy;   -- debe dar 9
