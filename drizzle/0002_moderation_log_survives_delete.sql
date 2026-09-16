ALTER TABLE `moderation_log` DROP FOREIGN KEY `moderation_log_work_id_works_id_fk`;
--> statement-breakpoint
ALTER TABLE `moderation_log` MODIFY COLUMN `work_id` varchar(36);--> statement-breakpoint
ALTER TABLE `moderation_log` MODIFY COLUMN `action` enum('approve','reject','archive','restore','delete') NOT NULL;--> statement-breakpoint
ALTER TABLE `moderation_log` ADD `work_title` varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE `moderation_log` ADD CONSTRAINT `moderation_log_work_id_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `works`(`id`) ON DELETE set null ON UPDATE no action;