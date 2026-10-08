import { findLocationLogByClientId, insertLocationLog } from "~/lib/db/queries/location-log";
import { findTrip } from "~/lib/db/queries/trip";
import { InsertTripLocationLog } from "~/lib/db/schema";
import { assertLocationOwned } from "~/utils/assert-references";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import getIdempotencyKey from "~/utils/get-idempotency-key";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const clientId = getIdempotencyKey(event);

  if (clientId) {
    const alreadyCreated = await findLocationLogByClientId(event.context.db, clientId, event.context.user.id);

    if (alreadyCreated) {
      return alreadyCreated;
    }
  }

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

  return insertLocationLog(event.context.db, locationId, { ...log, tripId: trip.id, clientId }, event.context.user.id);
});
