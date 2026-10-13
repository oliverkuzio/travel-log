import type { User } from "better-auth";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";

import type { AppDatabase } from "./db";

export type UserRole = "user" | "admin";

export type UserWithId = Omit<User, "id"> & {
  id: number;
  role: UserRole;
};

type AuthEnv = Pick<Env, "GITHUB_CLIENT_ID" | "GITHUB_CLIENT_SECRET" | "BETTER_AUTH_URL" | "BETTER_AUTH_SECRET" | "AUTH_ALLOWED_HOSTS">;

// Derived from the deployment's own config so forks only need to change `wrangler.jsonc`.
function getAllowedHosts(env: AuthEnv) {
  const extraHosts = (env.AUTH_ALLOWED_HOSTS ?? "").split(",").map(host => host.trim()).filter(Boolean);

  return [
    "localhost",
    "localhost:3000",
    new URL(env.BETTER_AUTH_URL).host,
    ...extraHosts,
  ];
}

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
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          input: false,
        },
      },
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: {
      allowedHosts: getAllowedHosts(env),
      protocol: env.BETTER_AUTH_URL.startsWith("https") ? "https" : "http",
    },
    advanced: {
      database: {
        generateId: false,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
