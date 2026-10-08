import type { H3Event } from "h3";

import { MAX_IMAGE_SIZE } from "~/lib/constants";
import { InsertLocation } from "~/lib/db/schema";
import sendZodError from "~/utils/send-zod-error";

/**
 * Reads a location from either a JSON body, or a multipart body with the location as JSON in a "data"
 * field, plus an optional "coverImage" file or a "removeCoverImage" flag.
 */
export default async function readLocationBody(event: H3Event) {
  if (!getRequestHeader(event, "content-type")?.startsWith("multipart/form-data")) {
    const result = await readValidatedBody(event, InsertLocation.safeParse);

    if (!result.success) {
      return sendZodError(event, result.error);
    }

    return { location: result.data, coverImage: null, removeCoverImage: false };
  }

  const formData = await readFormData(event);
  const data = formData.get("data");
  const coverImage = formData.get("coverImage");

  if (typeof data !== "string") {
    throw createError({ statusCode: 400, statusMessage: "No location data provided" });
  }

  let json: unknown;

  try {
    json = JSON.parse(data);
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid location data" });
  }

  const result = InsertLocation.safeParse(json);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  if (typeof coverImage === "string") {
    throw createError({ statusCode: 400, statusMessage: "Cover photo must be a file" });
  }

  if (coverImage && coverImage.size > MAX_IMAGE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: "Cover photo is too large" });
  }

  return {
    location: result.data,
    coverImage,
    removeCoverImage: formData.get("removeCoverImage") === "true",
  };
}

export async function putCoverImage(event: H3Event, file: File, userId: number) {
  const key = `${userId}/locations/${crypto.randomUUID()}.jpg`;

  await event.context.cloudflare.env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: "image/jpeg" },
  });

  return key;
}
