CREATE TABLE `location_import` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text NOT NULL,
	`name` text,
	`address` text,
	`google_maps_url` text NOT NULL,
	`query` text,
	`lat` real,
	`long` real,
	`user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `location_import_userId_googleMapsUrl_unique` ON `location_import` (`user_id`,`google_maps_url`);