import { findLocationType } from "~/lib/db/queries/location-type";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const locationType = await findLocationType(event.context.db, slug);

  if (!locationType) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location type not found.",
    });
  }

  return locationType;
});
