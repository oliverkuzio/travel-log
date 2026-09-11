import type { DrizzleError } from "drizzle-orm";

import slugify from "slug";

import { findTripByName, findUniqueSlug, insertTrip } from "~/lib/db/queries/trip";
import { InsertTrip } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertTrip.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingTrip = await findTripByName(event.context.db, result.data, event.context.user.id);

  if (existingTrip) {
    throw createError({
      statusCode: 409,
      statusMessage: "A trip with that name already exists!",
    });
  }

  const slug = await findUniqueSlug(event.context.db, slugify(result.data.name));

  try {
    return insertTrip(event.context.db, result.data, slug, event.context.user.id);
  }
  catch (e) {
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
