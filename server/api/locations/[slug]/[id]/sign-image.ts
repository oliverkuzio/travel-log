import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { z } from "zod";

import env from "~/lib/env";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

const MAX_CONTENT_LENGTH = 1024 * 1024 * 0.5;

const ImageScheme = z.object({
  contentLength: z.number().min(1).max(MAX_CONTENT_LENGTH),
  checksum: z.string(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, ImageScheme.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;

  await event.$fetch(`/api/locations/${slug}/${id}`);

  const client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_ENDPOINT.includes("localhost"),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_ACCESS_SECRET,
    },
  });

  const fileName = crypto.randomUUID();
  const key = `${event.context.user.id}/${id}/${fileName}.jpg`;

  const { url, fields } = await createPresignedPost(client, {
    Bucket: env.S3_BUCKET,
    Key: key,
    Expires: 120,
    Fields: {
      "x-amz-checksum-sha256": result.data.checksum,
    },
    Conditions: [
      ["content-length-range", result.data.contentLength, result.data.contentLength],
      ["eq", "$x-amz-meta-user-id", event.context.user.id.toString()],
      ["eq", "$x-amz-meta-location-log-id", id],
    ],
  });

  fields["x-amz-meta-user-id"] = event.context.user.id.toString();
  fields["x-amz-meta-location-log-id"] = id;

  return {
    url,
    fields,
    key,
  };
});
