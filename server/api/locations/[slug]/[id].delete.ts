import { z } from "zod";

import { findLocation } from "~/lib/db/queries/location";
import { deleteLocationLog } from "~/lib/db/queries/location-log";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  // await new Promise(resolve => setTimeout(resolve, 2000));
  const slug = getRouterParam(event, "slug") as string;
  const location = await findLocation(event.context.db, slug, event.context.user.id);

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  const id = getRouterParam(event, "id") as string;

  if (!z.coerce.number().safeParse(id).success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid location log ID.",
    });
  }

  const deleted = await deleteLocationLog(event.context.db, Number(id), event.context.user.id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location log not found.",
    });
  }

  if (deleted.images.length) {
    await event.context.cloudflare.env.BUCKET.delete(deleted.images.map(image => image.key));
  }

  setResponseStatus(event, 204);

  return deleted.log;
});
