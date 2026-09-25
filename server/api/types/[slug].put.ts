import { findLocationTypeByName, updateLocationType } from "~/lib/db/queries/location-type";
import { InsertLocationType } from "~/lib/db/schema";
import defineAdminEventHandler from "~/utils/define-admin-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAdminEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const result = await readValidatedBody(event, InsertLocationType.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingType = await findLocationTypeByName(event.context.db, result.data);

  if (existingType && existingType.slug !== slug) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location type with that name already exists!",
    });
  }

  const locationType = await updateLocationType(event.context.db, result.data, slug);

  if (!locationType) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location type not found.",
    });
  }

  return locationType;
});
