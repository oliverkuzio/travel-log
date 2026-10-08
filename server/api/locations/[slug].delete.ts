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

  const keys = deleted.images.map(image => image.key);

  if (deleted.location?.coverImageKey) {
    keys.push(deleted.location.coverImageKey);
  }

  if (keys.length) {
    await event.context.cloudflare.env.BUCKET.delete(keys);
  }

  setResponseStatus(event, 204);
});
