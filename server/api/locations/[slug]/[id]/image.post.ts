import { insertLocationLogImage } from "~/lib/db/queries/location-log-image";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

const MAX_FILE_SIZE = 1024 * 1024 * 0.5;

export default defineAuthenticatedEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;

  await event.$fetch(`/api/locations/${slug}/${id}`);

  const formData = await readFormData(event);
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    throw createError({ statusCode: 400, statusMessage: "No file provided" });
  }

  if (file.size > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: "File too large" });
  }

  const fileName = crypto.randomUUID();
  const key = `${event.context.user.id}/${id}/${fileName}.jpg`;

  await event.context.cloudflare.env.travel_log_bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: "image/jpeg" },
  });

  const inserted = await insertLocationLogImage(
    event.context.db,
    Number(id),
    { key },
    event.context.user.id,
  );

  return inserted;
});
