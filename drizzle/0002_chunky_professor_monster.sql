CREATE TABLE `support_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`category` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_support_messages_user_id` ON `support_messages` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_support_messages_status_created` ON `support_messages` (`status`,`created_at`);--> statement-breakpoint
ALTER TABLE `profiles` ADD `role` text DEFAULT 'member' NOT NULL;--> statement-breakpoint
UPDATE `profiles` SET `role` = 'admin' WHERE `user_id` = (SELECT `user_id` FROM `profiles` ORDER BY `created_at` ASC LIMIT 1);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_profiles_display_name_ci` ON `profiles` (lower("display_name"));
