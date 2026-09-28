import type { DrizzleError } from "drizzle-orm";

import slugify from "slug";

import { findLocationByName, findUniqueSlug, insertLocation } from "~/lib/db/queries/location";
import { deleteLocationImports, findLocationImport } from "~/lib/db/queries/location-import";
import { InsertLocation } from "~/lib/db/schema";
import { IdSchema } from "~/lib/zod-schemas";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

const ResolveSchema = InsertLocation.pick({
  name: true,
  address: true,
  lat: true,
  long: true,
});

export default defineAuthenticatedEventHandler(async (event) => {
  const id = IdSchema.safeParse(Number(getRouterParam(event, "id")));

  if (!id.success) {
    throw createError({ statusCode: 422, statusMessage: "Invalid id." });
  }

  const result = await readValidatedBody(event, ResolveSchema.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const { db, user } = event.context;
  const row = await findLocationImport(db, id.data, user.id);

  if (!row || row.status !== "lookup") {
    throw createError({ statusCode: 404, statusMessage: "Import item not found." });
  }

  const location: InsertLocation = {
    ...result.data,
    description: null,
    googleMapsUrl: row.googleMapsUrl,
    typeId: null,
  };

  if (await findLocationByName(db, location, user.id)) {
    throw createError({
      statusCode: 409,
      statusMessage: "A location with that name already exists!",
    });
  }

  const slug = await findUniqueSlug(db, slugify(location.name));

  try {
    const created = await insertLocation(db, location, slug, user.id);
    await deleteLocationImports(db, [row.id], user.id);

    return created;
  }
  catch (e) {
    const error = e as DrizzleError;

    throw createError({
      statusCode: error.message.includes("UNIQUE constraint failed") ? 409 : 500,
      statusMessage: error.message.includes("UNIQUE constraint failed")
        ? "A location with that name already exists."
        : "An unknown error has occurred.",
    });
  }
});
