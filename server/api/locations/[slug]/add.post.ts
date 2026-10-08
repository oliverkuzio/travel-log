import { findLocation } from "~/lib/db/queries/location";
import { findLocationLogByClientId, insertLocationLog } from "~/lib/db/queries/location-log";
import { InsertLocationLog } from "~/lib/db/schema";
import { assertTripOwned } from "~/utils/assert-references";
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
  const location = await findLocation(event.context.db, slug, event.context.user.id);

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  const result = await readValidatedBody(event, InsertLocationLog.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  await assertTripOwned(event.context.db, result.data.tripId, event.context.user.id);

  return insertLocationLog(event.context.db, location.id, { ...result.data, clientId }, event.context.user.id);
});
