import { findLocationByName, updateLocation } from "~/lib/db/queries/location";
import { InsertLocation } from "~/lib/db/schema";
import { assertLocationTypeExists } from "~/utils/assert-references";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const result = await readValidatedBody(event, InsertLocation.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  await assertLocationTypeExists(event.context.db, result.data.typeId);

  const existingLocation = await findLocationByName(event.context.db, result.data, event.context.user.id);

  if (existingLocation && existingLocation.slug !== slug) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location with that name already exists!",
    });
  }

  const location = await updateLocation(event.context.db, result.data, slug, event.context.user.id);

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  return location;
});
