import { findLocationImports } from "~/lib/db/queries/location-import";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  return findLocationImports(event.context.db, event.context.user.id);
});
