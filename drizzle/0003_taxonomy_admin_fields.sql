ALTER TABLE `taxonomy` ADD `sort_order` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `taxonomy` ADD `created_by` varchar(36);--> statement-breakpoint
ALTER TABLE `taxonomy` ADD `updated_at` timestamp(3) DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `taxonomy` ADD CONSTRAINT `taxonomy_created_by_profiles_id_fk` FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `taxonomy_kind_order_idx` ON `taxonomy` (`kind`,`sort_order`);