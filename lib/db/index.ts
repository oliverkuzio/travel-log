import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Env = {
  DB: D1Database;
};

export default {
  async fetch(request: Request, env: Env) {
    const db = drizzle(env.DB, {
      schema,
      casing: "snake_case",
    });

    return db;
  },
};
