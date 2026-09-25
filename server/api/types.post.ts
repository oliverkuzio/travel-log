import slugify from "slug";

import { findLocationTypeByName, findUniqueSlug, insertLocationType } from "~/lib/db/queries/location-type";
import { InsertLocationType } from "~/lib/db/schema";
import defineAdminEventHandler from "~/utils/define-admin-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAdminEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertLocationType.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  if (await findLocationTypeByName(event.context.db, result.data)) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location type with that name already exists!",
    });
  }

  const slug = await findUniqueSlug(event.context.db, slugify(result.data.name));

  return insertLocationType(event.context.db, result.data, slug);
});
