import type { H3Event } from "h3";
import type { z, ZodTypeAny } from "zod";

import { MAX_IMAGE_SIZE } from "~/lib/constants";
import sendZodError from "~/utils/send-zod-error";

type BodyWithCoverImage<T extends ZodTypeAny> = {
  data: z.output<T>;
  coverImage: File | null;
  removeCoverImage: boolean;
};

/**
 * Reads either a JSON body, or a multipart body with the JSON in a "data" field plus an optional
 * "coverImage" file or a "removeCoverImage" flag.
 */
export default async function readCoverImageBody<T extends ZodTypeAny>(event: H3Event, schema: T): Promise<BodyWithCoverImage<T>> {
  if (!getRequestHeader(event, "content-type")?.startsWith("multipart/form-data")) {
    const result = await readValidatedBody(event, body => schema.safeParse(body));

    if (!result.success) {
      return sendZodError(event, result.error);
    }

    return { data: result.data, coverImage: null, removeCoverImage: false };
  }

  const formData = await readFormData(event);
  const data = formData.get("data");
  const coverImage = formData.get("coverImage");

  if (typeof data !== "string") {
    throw createError({ statusCode: 400, statusMessage: "No data provided" });
  }

  let json: unknown;

  try {
    json = JSON.parse(data);
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid data" });
  }

  const result = schema.safeParse(json);

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
    data: result.data,
    coverImage,
    removeCoverImage: formData.get("removeCoverImage") === "true",
  };
}

export async function putCoverImage(event: H3Event, file: File, userId: number, folder: "locations" | "trips") {
  const key = `${userId}/${folder}/${crypto.randomUUID()}.jpg`;

  await event.context.cloudflare.env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: "image/jpeg" },
  });

  return key;
}
