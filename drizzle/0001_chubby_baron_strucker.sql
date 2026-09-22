ALTER TABLE `listings` ADD `postage_pence` integer;--> statement-breakpoint
ALTER TABLE `profiles` ADD `first_name` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `surname` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `date_of_birth` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `registration_complete` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `safety_accepted_at` text;