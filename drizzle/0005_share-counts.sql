CREATE TABLE `work_share_receipts` (
	`id` varchar(36) NOT NULL,
	`work_id` varchar(36) NOT NULL,
	`session_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `work_share_receipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `work_share_receipts_work_session_key` UNIQUE(`work_id`,`session_id`)
);
--> statement-breakpoint
ALTER TABLE `works` ADD `shares_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `work_share_receipts` ADD CONSTRAINT `work_share_receipts_work_id_works_id_fk` FOREIGN KEY (`work_id`) REFERENCES `works`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `work_share_receipts_created_idx` ON `work_share_receipts` (`created_at`);--> statement-breakpoint
