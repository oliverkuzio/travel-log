import { ZodError } from "zod";

import { findLocationNamesAndUrls } from "~/lib/db/queries/location";
import { insertLocationImports } from "~/lib/db/queries/location-import";
import { MAX_TAKEOUT_FILE_SIZE, parseTakeoutSavedPlaces } from "~/lib/google-takeout";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

const FILE_TOO_LARGE = createError({
  statusCode: 413,
  statusMessage: `File must be smaller than ${MAX_TAKEOUT_FILE_SIZE / 1024 / 1024}MB.`,
});

export default defineAuthenticatedEventHandler(async (event) => {
  // Reject oversized uploads before reading the body. The multipart envelope adds a little
  // overhead, so allow a small margin over the file limit.
  const contentLength = Number(getRequestHeader(event, "content-length"));

  if (!contentLength) {
    throw createError({ statusCode: 411, statusMessage: "Content-Length is required." });
  }

  if (contentLength > MAX_TAKEOUT_FILE_SIZE + 1024 * 16) {
    throw FILE_TOO_LARGE;
  }

  const formData = await readFormData(event);
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    throw createError({ statusCode: 400, statusMessage: "No file provided." });
  }

  if (!file.name.toLowerCase().endsWith(".json")) {
    throw createError({ statusCode: 415, statusMessage: "File must be a .json file." });
  }

  if (file.size > MAX_TAKEOUT_FILE_SIZE) {
    throw FILE_TOO_LARGE;
  }

  let json: unknown;

  try {
    json = JSON.parse(await file.text());
  }
  catch {
    throw createError({ statusCode: 422, statusMessage: "File is not valid JSON." });
  }

  let parsed: ReturnType<typeof parseTakeoutSavedPlaces>;

  try {
    parsed = parseTakeoutSavedPlaces(json);
  }
  catch (e) {
    if (e instanceof ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: "File is not a Google Takeout \"Saved Places.json\" file.",
      });
    }

    throw e;
  }

  // Skip places that were already imported, or clash with an existing location's name.
  const existing = await findLocationNamesAndUrls(event.context.db, event.context.user.id);
  const places = parsed.places.filter(place =>
    !existing.urls.has(place.googleMapsUrl) && !(place.name && existing.names.has(place.name)),
  );

  // Rows the user has already staged are ignored on insert, so count what was actually staged.
  const staged = await insertLocationImports(event.context.db, places, event.context.user.id);

  return {
    staged,
    duplicates: parsed.places.length - staged,
    invalid: parsed.invalid,
  };
});
