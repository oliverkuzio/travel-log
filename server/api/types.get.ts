import { findLocationTypes } from "~/lib/db/queries/location-type";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  return findLocationTypes(event.context.db);
});
