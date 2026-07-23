CREATE TABLE `locationType` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `locationType_slug_unique` ON `locationType` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `locationType_icon_unique` ON `locationType` (`icon`);--> statement-breakpoint
CREATE TABLE `trip` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`started_at` integer NOT NULL,
	`ended_at` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trip_slug_unique` ON `trip` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `trip_name_userId_unique` ON `trip` (`name`,`user_id`);--> statement-breakpoint
ALTER TABLE `location` ADD `type_id` integer REFERENCES locationType(id);--> statement-breakpoint
ALTER TABLE `locationLog` ADD `trip_id` integer REFERENCES trip(id);--> statement-breakpoint
ALTER TABLE `locationLog` DROP COLUMN `lat`;--> statement-breakpoint
ALTER TABLE `locationLog` DROP COLUMN `long`;