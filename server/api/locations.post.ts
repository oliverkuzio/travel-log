import type { DrizzleError } from "drizzle-orm";

import slugify from "slug";

import { findLocationByName, findUniqueSlug, insertLocation } from "~/lib/db/queries/location";
import { assertLocationTypeExists } from "~/utils/assert-references";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import readLocationBody, { putCoverImage } from "~/utils/read-location-body";

export default defineAuthenticatedEventHandler(async (event) => {
  const { location: data, coverImage } = await readLocationBody(event);

  await assertLocationTypeExists(event.context.db, data.typeId);

  const existingLocation = await findLocationByName(event.context.db, data, event.context.user.id);

  if (existingLocation) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location with that name already exists!",
    });
  }

  const slug = await findUniqueSlug(event.context.db, slugify(data.name));
  const coverImageKey = coverImage ? await putCoverImage(event, coverImage, event.context.user.id) : null;

  try {
    return await insertLocation(event.context.db, { ...data, coverImageKey }, slug, event.context.user.id);
  }
  catch (e) {
    if (coverImageKey) {
      await event.context.cloudflare.env.BUCKET.delete(coverImageKey);
    }

    const error = e as DrizzleError;
    let statusCode = 500;
    let statusMessage = "An unknown error has occurred.";

    switch (error.message) {
      case "SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: location.name, location.user_id":
        statusCode = 409;
        statusMessage = "A location with that name already exists. Location names must be unqiue for each user.";
        break;
      case "SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: location.slug":
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
