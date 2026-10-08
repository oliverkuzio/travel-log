import { deleteTrip } from "~/lib/db/queries/trip";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const deleted = await deleteTrip(event.context.db, slug, event.context.user.id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "Trip not found.",
    });
  }

  if (deleted.coverImageKey) {
    await event.context.cloudflare.env.BUCKET.delete(deleted.coverImageKey);
  }

  setResponseStatus(event, 204);
});
