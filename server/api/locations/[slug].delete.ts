import { deleteLocation } from "~/lib/db/queries/location";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const deleted = await deleteLocation(event.context.db, slug, event.context.user.id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  if (deleted.images.length) {
    await event.context.cloudflare.env.BUCKET.delete(deleted.images.map(image => image.key));
  }

  setResponseStatus(event, 204);
});
