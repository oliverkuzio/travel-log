import { z } from "zod";

import tryParseEnv from "./try-parse-env";

// Validated at build time only — runtime env comes from Cloudflare bindings
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

tryParseEnv(EnvSchema);

// eslint-disable-next-line node/no-process-env
export default EnvSchema.parse(process.env);
