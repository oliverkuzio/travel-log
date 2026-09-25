import { deleteLocationType } from "~/lib/db/queries/location-type";
import defineAdminEventHandler from "~/utils/define-admin-event-handler";

export default defineAdminEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const deleted = await deleteLocationType(event.context.db, slug);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location type not found.",
    });
  }

  setResponseStatus(event, 204);
});
