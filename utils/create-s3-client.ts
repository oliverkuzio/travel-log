import { S3Client } from "@aws-sdk/client-s3";

type S3Env = Pick<Env, "S3_REGION" | "S3_ENDPOINT" | "S3_ACCESS_KEY" | "S3_ACCESS_SECRET">;

export default function createS3Client(env: S3Env) {
  return new S3Client({
    region: "auto",
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_ENDPOINT.includes("localhost"),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_ACCESS_SECRET,
    },
  });
}
