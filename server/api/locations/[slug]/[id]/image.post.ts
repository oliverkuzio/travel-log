import { MAX_IMAGE_SIZE } from "~/lib/constants";
import { findLocationLogImageByClientId, insertLocationLogImage } from "~/lib/db/queries/location-log-image";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import getIdempotencyKey from "~/utils/get-idempotency-key";

export default defineAuthenticatedEventHandler(async (event) => {
  const clientId = getIdempotencyKey(event);

  if (clientId) {
    const alreadyCreated = await findLocationLogImageByClientId(event.context.db, clientId, event.context.user.id);

    if (alreadyCreated) {
      return alreadyCreated;
    }
  }

  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;

  await event.$fetch(`/api/locations/${slug}/${id}`);

  const formData = await readFormData(event);
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    throw createError({ statusCode: 400, statusMessage: "No file provided" });
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: "File too large" });
  }

  // Reusing the idempotency key means a retried upload overwrites the same object.
  const fileName = clientId ?? crypto.randomUUID();
  const key = `${event.context.user.id}/${id}/${fileName}.jpg`;

  await event.context.cloudflare.env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: "image/jpeg" },
  });

  const inserted = await insertLocationLogImage(
    event.context.db,
    Number(id),
    { key, clientId },
    event.context.user.id,
  );

  return inserted;
});
