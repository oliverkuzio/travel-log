import type { AppDatabase } from "~/lib/db";

import { findLocationById } from "~/lib/db/queries/location";
import { findLocationTypeById } from "~/lib/db/queries/location-type";
import { findTripById } from "~/lib/db/queries/trip";

export async function assertTripOwned(db: AppDatabase, tripId: number | null | undefined, userId: number) {
  if (tripId && !(await findTripById(db, tripId, userId))) {
    throw createError({
      statusCode: 422,
      statusMessage: "Trip not found.",
    });
  }
}

export async function assertLocationOwned(db: AppDatabase, locationId: number, userId: number) {
  const location = await findLocationById(db, locationId, userId);

  if (!location) {
    throw createError({
      statusCode: 422,
      statusMessage: "Location not found.",
    });
  }

  return location;
}

export async function assertLocationTypeExists(db: AppDatabase, typeId: number | null | undefined) {
  if (typeId && !(await findLocationTypeById(db, typeId))) {
    throw createError({
      statusCode: 422,
      statusMessage: "Location type not found.",
    });
  }
}
