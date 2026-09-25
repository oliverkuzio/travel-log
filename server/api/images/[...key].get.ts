import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const key = getRouterParam(event, "key");

  if (!key) {
    throw createError({ statusCode: 400, statusMessage: "Invalid key" });
  }

  const [keyUserId] = key.split("/");

  if (keyUserId !== event.context.user.id.toString()) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const object = await event.context.cloudflare.env.BUCKET.get(key);

  if (!object) {
    throw createError({ statusCode: 404, statusMessage: "Image not found" });
  }

  setResponseHeader(event, "Content-Type", "image/jpeg");
  setResponseHeader(event, "Cache-Control", "private, max-age=31536000, immutable");

  return sendStream(event, object.body);
});
