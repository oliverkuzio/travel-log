import { z } from "zod";

import type { InsertLocationImport } from "./db/schema";

import { AddressSchema, GoogleMapsUrlSchema, LatSchema, LongSchema, NameSchema } from "./zod-schemas";

export const MAX_TAKEOUT_FILE_SIZE = 1024 * 1024 * 5;
const MAX_TAKEOUT_FEATURES = 5000;

const TakeoutFeature = z.object({
  geometry: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
  }).nullish(),
  properties: z.object({
    google_maps_url: z.string().max(2048),
    location: z.object({
      name: z.string().nullish(),
      address: z.string().nullish(),
    }).nullish(),
  }),
});

export const TakeoutSavedPlaces = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(z.unknown()).max(MAX_TAKEOUT_FEATURES),
});

export type ParsedTakeoutPlace = Omit<InsertLocationImport, "userId" | "id" | "createdAt">;

export type ParsedTakeout = {
  places: ParsedTakeoutPlace[];
  invalid: number;
};

const GOOGLE_MAPS_HOSTS = new Set(["maps.google.com", "www.google.com", "google.com"]);

/**
 * Takeout links use http://maps.google.com; only accept Google hosts and upgrade them to https.
 */
export function normalizeGoogleMapsUrl(raw: string): URL | null {
  let url: URL;

  try {
    url = new URL(raw);
  }
  catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol) || !GOOGLE_MAPS_HOSTS.has(url.hostname)) {
    return null;
  }

  url.protocol = "https:";

  return GoogleMapsUrlSchema.safeParse(url.toString()).success ? url : null;
}

function parseFeature(feature: unknown): ParsedTakeoutPlace | null {
  const result = TakeoutFeature.safeParse(feature);

  if (!result.success) {
    return null;
  }

  const { geometry, properties } = result.data;
  const url = normalizeGoogleMapsUrl(properties.google_maps_url);

  if (!url) {
    return null;
  }

  const googleMapsUrl = url.toString();
  const [long, lat] = geometry?.coordinates ?? [0, 0];
  const hasCoords = LatSchema.safeParse(lat).success
    && LongSchema.safeParse(long).success
    && !(lat === 0 && long === 0);
  const name = NameSchema.safeParse(properties.location?.name?.trim().slice(0, 100));

  if (hasCoords && name.success) {
    const address = AddressSchema.safeParse(properties.location?.address?.slice(0, 500) ?? null);

    return {
      status: "ready",
      name: name.data,
      address: address.success ? address.data : null,
      googleMapsUrl,
      query: null,
      lat,
      long,
    };
  }

  const query = url.searchParams.get("q")?.trim().slice(0, 500);

  if (query) {
    return {
      status: "lookup",
      name: null,
      address: null,
      googleMapsUrl,
      query,
      lat: null,
      long: null,
    };
  }

  return null;
}

/**
 * Parses a Google Takeout "Saved Places.json" file. Malformed features are counted as invalid
 * rather than failing the whole file. Throws a ZodError if the file isn't a FeatureCollection.
 */
export function parseTakeoutSavedPlaces(json: unknown): ParsedTakeout {
  const { features } = TakeoutSavedPlaces.parse(json);
  const places: ParsedTakeoutPlace[] = [];
  let invalid = 0;

  for (const feature of features) {
    const place = parseFeature(feature);

    if (place) {
      places.push(place);
    }
    else {
      invalid++;
    }
  }

  return { places, invalid };
}

/**
 * Splits a Google query such as "Nab Scar, Ambleside LA22 9SF" into a name and an address.
 */
export function splitTakeoutQuery(query: string) {
  const commaIndex = query.indexOf(",");

  return {
    name: (commaIndex === -1 ? query : query.slice(0, commaIndex)).trim().slice(0, 100),
    address: commaIndex === -1 ? null : query.slice(commaIndex + 1).trim() || null,
  };
}
