import type { DrizzleError } from "drizzle-orm";

import slugify from "slug";

import { findTripByName, findUniqueSlug, insertTrip } from "~/lib/db/queries/trip";
import { InsertTrip } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import readCoverImageBody, { putCoverImage } from "~/utils/read-cover-image-body";

export default defineAuthenticatedEventHandler(async (event) => {
  const { data, coverImage } = await readCoverImageBody(event, InsertTrip);

  const existingTrip = await findTripByName(event.context.db, data, event.context.user.id);

  if (existingTrip) {
    throw createError({
      statusCode: 409,
      statusMessage: "A trip with that name already exists!",
    });
  }

  const slug = await findUniqueSlug(event.context.db, slugify(data.name));
  const coverImageKey = coverImage ? await putCoverImage(event, coverImage, event.context.user.id, "trips") : null;

  try {
    return await insertTrip(event.context.db, { ...data, coverImageKey }, slug, event.context.user.id);
  }
  catch (e) {
    if (coverImageKey) {
      await event.context.cloudflare.env.BUCKET.delete(coverImageKey);
    }

    const error = e as DrizzleError;
    let statusCode = 500;
    let statusMessage = "An unknown error has occurred.";

    switch (error.message) {
      case "SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: trip.name, trip.user_id":
        statusCode = 409;
        statusMessage = "A trip with that name already exists. Trip names must be unqiue for each user.";
        break;
      case "SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: trip.slug":
        statusCode = 409;
        statusMessage = "Slug must be unique.";
        break;
      default:
        break;
    }

    throw createError({
      statusCode,
      statusMessage,
    });
  }
});
