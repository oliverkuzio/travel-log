import { findLocationByName, findOwnedLocationBySlug, updateLocation } from "~/lib/db/queries/location";
import { InsertLocation } from "~/lib/db/schema";
import { assertLocationTypeExists } from "~/utils/assert-references";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import readCoverImageBody, { putCoverImage } from "~/utils/read-cover-image-body";

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const { data, coverImage, removeCoverImage } = await readCoverImageBody(event, InsertLocation);

  await assertLocationTypeExists(event.context.db, data.typeId);

  const existingLocation = await findLocationByName(event.context.db, data, event.context.user.id);

  if (existingLocation && existingLocation.slug !== slug) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location with that name already exists!",
    });
  }

  const current = await findOwnedLocationBySlug(event.context.db, slug, event.context.user.id);

  if (!current) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  // undefined leaves the existing cover photo in place.
  let coverImageKey: string | null | undefined;

  if (coverImage) {
    coverImageKey = await putCoverImage(event, coverImage, event.context.user.id, "locations");
  }
  else if (removeCoverImage) {
    coverImageKey = null;
  }

  let location;

  try {
    location = await updateLocation(event.context.db, { ...data, coverImageKey }, slug, event.context.user.id);
  }
  catch (e) {
    if (coverImageKey) {
      await event.context.cloudflare.env.BUCKET.delete(coverImageKey);
    }

    throw e;
  }

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  if (coverImageKey !== undefined && current.coverImageKey) {
    await event.context.cloudflare.env.BUCKET.delete(current.coverImageKey);
  }

  return location;
});
