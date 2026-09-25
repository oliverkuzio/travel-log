import { z } from "zod";

import { findLocation } from "~/lib/db/queries/location";
import { updateLocationLog } from "~/lib/db/queries/location-log";
import { InsertLocationLog } from "~/lib/db/schema";
import { assertTripOwned } from "~/utils/assert-references";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  // await new Promise(resolve => setTimeout(resolve, 2000));
  const slug = getRouterParam(event, "slug") as string;

  const result = await readValidatedBody(event, InsertLocationLog.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  await assertTripOwned(event.context.db, result.data.tripId, event.context.user.id);

  const location = await findLocation(event.context.db, slug, event.context.user.id);

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  const id = getRouterParam(event, "id") as string;

  if (!z.coerce.number().safeParse(id).success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid location log ID.",
    });
  }

  const locationLog = await updateLocationLog(event.context.db, result.data, Number(id), event.context.user.id);

  if (!locationLog) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location log not found.",
    });
  }

  return locationLog;
});
