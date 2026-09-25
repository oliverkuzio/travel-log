import { findTripByName, updateTrip } from "~/lib/db/queries/trip";
import { InsertTrip } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const result = await readValidatedBody(event, InsertTrip.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingTrip = await findTripByName(event.context.db, result.data, event.context.user.id);

  if (existingTrip && existingTrip.slug !== slug) {
    throw createError({
      statusCode: 409,
      statusMessage: "A trip with that name already exists!",
    });
  }

  const trip = await updateTrip(event.context.db, result.data, slug, event.context.user.id);

  if (!trip) {
    throw createError({
      statusCode: 404,
      statusMessage: "Trip not found.",
    });
  }

  return trip;
});
