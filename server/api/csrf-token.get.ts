import * as csrf from "uncsrf";

/**
 * A fresh CSRF token for the current csrf cookie, the same one nuxt-csurf puts in the page's
 * `csrf-token` meta tag. Pages served from the offline cache can carry a stale token (the secret
 * changes with each build), so the app fetches this before syncing changes or after a 403.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event).csurf;
  const { cookieKey, encryptSecret } = config;

  // Always set by nuxt-csurf at build time.
  if (!cookieKey || !encryptSecret) {
    throw createError({ statusCode: 500, statusMessage: "CSRF protection is not configured." });
  }

  let secret = getCookie(event, cookieKey);

  if (!secret) {
    secret = csrf.randomSecret();
    setCookie(event, cookieKey, secret, config.cookie);
  }

  const key = await csrf.importEncryptSecret(encryptSecret, config.encryptAlgorithm);
  setResponseHeader(event, "Cache-Control", "no-store");

  return { token: await csrf.create(secret, key, config.encryptAlgorithm) };
});
