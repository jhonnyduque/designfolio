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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `moderation_log` (
	`id` varchar(36) NOT NULL,
	`work_id` varchar(36) NOT NULL,
	`actor_id` varchar(36) NOT NULL,
	`action` enum('approve','reject','archive','delete') NOT NULL,
	`note` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `moderation_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `comments_work_created_idx` ON `comments` (`work_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `likes_work_idx` ON `likes` (`work_id`);--> statement-breakpoint
CREATE INDEX `moderation_log_work_idx` ON `moderation_log` (`work_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_created_idx` ON `notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `works_author_created_idx` ON `works` (`author_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `works_status_published_idx` ON `works` (`moderation_status`,`published_at`);