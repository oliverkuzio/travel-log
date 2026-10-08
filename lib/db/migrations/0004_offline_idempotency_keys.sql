ALTER TABLE `location` ADD `client_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `location_userId_clientId_unique` ON `location` (`user_id`,`client_id`);--> statement-breakpoint
ALTER TABLE `locationLog` ADD `client_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `locationLog_userId_clientId_unique` ON `locationLog` (`user_id`,`client_id`);--> statement-breakpoint
ALTER TABLE `locationLogImage` ADD `client_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `locationLogImage_userId_clientId_unique` ON `locationLogImage` (`user_id`,`client_id`);--> statement-breakpoint
ALTER TABLE `trip` ADD `client_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `trip_userId_clientId_unique` ON `trip` (`user_id`,`client_id`);