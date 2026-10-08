import { findOwnedTripBySlug, findTripByName, updateTrip } from "~/lib/db/queries/trip";
import { InsertTrip } from "~/lib/db/schema";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import readCoverImageBody, { putCoverImage } from "~/utils/read-cover-image-body";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const { data, coverImage, removeCoverImage } = await readCoverImageBody(event, InsertTrip);

  const existingTrip = await findTripByName(event.context.db, data, event.context.user.id);

  if (existingTrip && existingTrip.slug !== slug) {
    throw createError({
      statusCode: 409,
      statusMessage: "A trip with that name already exists!",
    });
  }

  const current = await findOwnedTripBySlug(event.context.db, slug, event.context.user.id);

  if (!current) {
    throw createError({
      statusCode: 404,
      statusMessage: "Trip not found.",
    });
  }

  // undefined leaves the existing cover photo in place.
  let coverImageKey: string | null | undefined;

  if (coverImage) {
    coverImageKey = await putCoverImage(event, coverImage, event.context.user.id, "trips");
  }
  else if (removeCoverImage) {
    coverImageKey = null;
  }

  let trip;

  try {
    trip = await updateTrip(event.context.db, { ...data, coverImageKey }, slug, event.context.user.id);
  }
  catch (e) {
    if (coverImageKey) {
      await event.context.cloudflare.env.BUCKET.delete(coverImageKey);
    }

    throw e;
  }

  if (!trip) {
    throw createError({
      statusCode: 404,
      statusMessage: "Trip not found.",
    });
  }

  if (coverImageKey !== undefined && current.coverImageKey) {
    await event.context.cloudflare.env.BUCKET.delete(current.coverImageKey);
  }

  return trip;
});
