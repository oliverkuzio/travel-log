import { findTrip } from "~/lib/db/queries/trip";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  // await new Promise(resolve => setTimeout(resolve, 2000));
  const slug = getRouterParam(event, "slug") as string;
  const trip = await findTrip(event.context.db, slug, event.context.user.id);

  if (!trip) {
    throw createError({
      statusCode: 404,
      statusMessage: "Trip not found.",
    });
  }

  return trip;
});
