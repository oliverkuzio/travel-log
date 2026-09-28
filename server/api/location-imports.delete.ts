import { deleteAllLocationImports } from "~/lib/db/queries/location-import";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  await deleteAllLocationImports(event.context.db, event.context.user.id);
  setResponseStatus(event, 204);
});
