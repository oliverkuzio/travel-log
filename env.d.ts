/// <reference types="@cloudflare/workers-types/2023-07-01" />

import type { Auth } from "~/lib/auth";
import type { AppDatabase } from "~/lib/db";

declare module "h3" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface H3EventContext {
    cf: CfProperties;
    cloudflare: {
      request: Request;
      env: Env;
      context: ExecutionContext;
    };
    db: AppDatabase;
    auth: Auth;
  };
}

export {};
