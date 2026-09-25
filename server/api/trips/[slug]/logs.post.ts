import { insertLocationLog } from "~/lib/db/queries/location-log";
import { findTrip } from "~/lib/db/queries/trip";
import { InsertTripLocationLog } from "~/lib/db/schema";
import { assertLocationOwned } from "~/utils/assert-references";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const trip = await findTrip(event.context.db, slug, event.context.user.id);

  if (!trip) {
    throw createError({
      statusCode: 404,
      statusMessage: "Trip not found.",
    });
  }

  const result = await readValidatedBody(event, InsertTripLocationLog.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const { locationId, ...log } = result.data;
  await assertLocationOwned(event.context.db, locationId, event.context.user.id);

  return insertLocationLog(event.context.db, locationId, { ...log, tripId: trip.id }, event.context.user.id);
});
