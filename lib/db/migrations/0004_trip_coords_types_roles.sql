-- NOTE: drizzle-kit generated table rebuilds for `location` and `locationLog` to change
-- `type_id` / `trip_id` to ON DELETE SET NULL. They have been removed on purpose: D1 always
-- enforces foreign keys, so `DROP TABLE location` would cascade-delete every location log
-- (and their images) before the copy. The SET NULL behaviour is applied in application code
-- instead (see `deleteTrip` and `deleteLocationType` in lib/db/queries).
ALTER TABLE `user` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `trip` DROP COLUMN `lat`;--> statement-breakpoint
ALTER TABLE `trip` DROP COLUMN `long`;--> statement-breakpoint
INSERT OR IGNORE INTO `locationType` (`name`, `slug`, `icon`, `description`, `created_at`, `updated_at`) VALUES
	('Attraction', 'attraction', 'tabler:building-monument', 'Landmarks and sights worth seeing.', unixepoch() * 1000, unixepoch() * 1000),
	('Bar', 'bar', 'tabler:beer', 'Pubs, bars and breweries.', unixepoch() * 1000, unixepoch() * 1000),
	('Restaurant', 'restaurant', 'tabler:tools-kitchen-2', 'Places to eat.', unixepoch() * 1000, unixepoch() * 1000),
	('Cafe', 'cafe', 'tabler:coffee', 'Coffee shops and cafes.', unixepoch() * 1000, unixepoch() * 1000),
	('Accommodation', 'accommodation', 'tabler:bed', 'Hotels, hostels and places to stay.', unixepoch() * 1000, unixepoch() * 1000),
	('Museum', 'museum', 'tabler:building-bank', 'Museums and galleries.', unixepoch() * 1000, unixepoch() * 1000),
	('Park', 'park', 'tabler:trees', 'Parks, gardens and nature.', unixepoch() * 1000, unixepoch() * 1000),
	('Beach', 'beach', 'tabler:beach', 'Beaches and coastline.', unixepoch() * 1000, unixepoch() * 1000),
	('Viewpoint', 'viewpoint', 'tabler:binoculars', 'Lookouts and scenic views.', unixepoch() * 1000, unixepoch() * 1000),
	('Shop', 'shop', 'tabler:shopping-bag', 'Shops and markets.', unixepoch() * 1000, unixepoch() * 1000),
	('Transport', 'transport', 'tabler:train', 'Stations, airports and ports.', unixepoch() * 1000, unixepoch() * 1000),
	('Other', 'other', 'tabler:map-pin', 'Anything else.', unixepoch() * 1000, unixepoch() * 1000);
