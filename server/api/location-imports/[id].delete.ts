import { deleteLocationImports } from "~/lib/db/queries/location-import";
import { IdSchema } from "~/lib/zod-schemas";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = IdSchema.safeParse(Number(getRouterParam(event, "id")));

  if (!id.success) {
    throw createError({ statusCode: 422, statusMessage: "Invalid id." });
  }

  await deleteLocationImports(event.context.db, [id.data], event.context.user.id);
  setResponseStatus(event, 204);
});
