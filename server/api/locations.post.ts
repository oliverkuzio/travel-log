import type { DrizzleError } from "drizzle-orm";

import slugify from "slug";

import { findLocationByClientId, findLocationByName, findUniqueSlug, insertLocation } from "~/lib/db/queries/location";
import { InsertLocation } from "~/lib/db/schema";
import { assertLocationTypeExists } from "~/utils/assert-references";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import getIdempotencyKey from "~/utils/get-idempotency-key";
import readCoverImageBody, { putCoverImage } from "~/utils/read-cover-image-body";

export default defineAuthenticatedEventHandler(async (event) => {
  const clientId = getIdempotencyKey(event);

  if (clientId) {
    const alreadyCreated = await findLocationByClientId(event.context.db, clientId, event.context.user.id);

    if (alreadyCreated) {
      return alreadyCreated;
    }
  }

  const { data, coverImage } = await readCoverImageBody(event, InsertLocation);

  await assertLocationTypeExists(event.context.db, data.typeId);

  const existingLocation = await findLocationByName(event.context.db, data, event.context.user.id);

  if (existingLocation) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location with that name already exists!",
    });
  }

  const slug = await findUniqueSlug(event.context.db, slugify(data.name));
  const coverImageKey = coverImage ? await putCoverImage(event, coverImage, event.context.user.id, "locations") : null;

  try {
    return await insertLocation(event.context.db, { ...data, coverImageKey, clientId }, slug, event.context.user.id);
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
