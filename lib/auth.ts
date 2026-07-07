import type { User } from "better-auth";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/plugins";

import type { AppDatabase } from "./db";

export type UserWithId = Omit<User, "id"> & {
  id: number;
};

type AuthEnv = Pick<Env, "AUTH_GITHUB_CLIENT_ID" | "AUTH_GITHUB_CLIENT_SECRET" | "BETTER_AUTH_SECRET" | "BETTER_AUTH_URL">;

export function createAuth(db: AppDatabase, env: AuthEnv) {
  return betterAuth({
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/get-session") {
          if (!ctx.context.session) {
            return ctx.json({
              session: null,
              user: null,
            });
          }
          return ctx.json(ctx.context.session);
        }
      }),
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    socialProviders: {
      github: {
        clientId: env.AUTH_GITHUB_CLIENT_ID,
        clientSecret: env.AUTH_GITHUB_CLIENT_SECRET,
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.BETTER_AUTH_URL, "http://localhost:3000"],
    advanced: {
      database: {
        generateId: false,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
