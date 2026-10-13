import type { NominatimResult } from "~/lib/types";

import { SearchSchema } from "~/lib/zod-schemas";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";
import sendZodError from "~/utils/send-zod-error";

export default defineAuthenticatedEventHandler(
  defineCachedEventHandler(async (event) => {
    const result = await getValidatedQuery(event, SearchSchema.safeParse);

    if (!result.success) {
      return sendZodError(event, result.error);
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(result.data.q)}&format=json&accept-language=en`, {
        signal: AbortSignal.timeout(5000),
        headers: {
          // Nominatim's usage policy requires a User-Agent that identifies the deployment.
          "User-Agent": `Travel Log (${new URL(event.context.cloudflare.env.BETTER_AUTH_URL).host})`,
        },
      });

      if (!response.ok) {
        throw createError({
          statusCode: 504,
          statusMessage: "Unable to reach search API.",
        });
      }

      const results = await response.json() as NominatimResult[];
      return results;
    }
    catch {
      throw createError({
        statusCode: 504,
        statusMessage: "Unable to reach search API.",
      });
    }
  }, {
    maxAge: 60 * 60 * 24,
    // Renamed when switching to English results, so cached local-language results aren't reused.
    name: "search-nominatim-en",
    getKey: async (event) => {
      const query = await getQuery(event);

      return query.q?.toString() || "";
    },
  }),
);
