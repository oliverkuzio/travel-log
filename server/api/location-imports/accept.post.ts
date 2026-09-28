import slugify from "slug";
import { z } from "zod";

import { findLocationNamesAndUrls, findUniqueSlugs, insertLocations } from "~/lib/db/queries/location";
import { deleteLocationImports, findLocationImportsByIds, findReadyLocationImports } from "~/lib/db/queries/location-import";
import { InsertLocation } from "~/lib/db/schema";
import { IdSchema } from "~/lib/zod-schemas";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

const AcceptSchema = z.union([
  z.object({ ids: z.array(IdSchema).min(1).max(1000) }),
  z.object({ all: z.literal(true) }),
]);

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, AcceptSchema.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const { db, user } = event.context;
  const rows = "all" in result.data
    ? await findReadyLocationImports(db, user.id)
    : (await findLocationImportsByIds(db, result.data.ids, user.id)).filter(row => row.status === "ready");

  const { names } = await findLocationNamesAndUrls(db, user.id);
  const insertables: InsertLocation[] = [];
  const skipped: { name: string; reason: string }[] = [];

  for (const row of rows) {
    const location = InsertLocation.safeParse({
      name: row.name,
      description: null,
      address: row.address,
      googleMapsUrl: row.googleMapsUrl,
      lat: row.lat,
      long: row.long,
      typeId: null,
    });

    if (!location.success) {
      skipped.push({ name: row.name ?? row.googleMapsUrl, reason: "Invalid location details." });
    }
    else if (names.has(location.data.name)) {
      skipped.push({ name: location.data.name, reason: "A location with that name already exists." });
    }
    else {
      names.add(location.data.name);
      insertables.push(location.data);
    }
  }

  const slugs = await findUniqueSlugs(db, insertables.map(location => slugify(location.name)));
  const added = await insertLocations(db, insertables.map((location, i) => ({ ...location, slug: slugs[i]! })), user.id);

  // Skipped rows can't be accepted later either, so they're reported and cleared with the rest.
  await deleteLocationImports(db, rows.map(row => row.id), user.id);

  return { added, skipped };
});
