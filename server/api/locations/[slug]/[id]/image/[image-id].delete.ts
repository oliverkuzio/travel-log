import { z } from "zod";

import { deleteLocationLogImage } from "~/lib/db/queries/location-log-image";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  // await new Promise(resolve => setTimeout(resolve, 2000));

  const imageId = getRouterParam(event, "image-id") as string;

  if (!z.coerce.number().safeParse(imageId).success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid image ID.",
    });
  }

  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;

  await event.$fetch(`/api/locations/${slug}/${id}`);

  const deleted = await deleteLocationLogImage(event.context.db, Number(imageId), event.context.user.id);

  if (deleted) {
    await event.context.cloudflare.env.travel_log_bucket.delete(deleted.key);
  }

  setResponseStatus(event, 204);
});
