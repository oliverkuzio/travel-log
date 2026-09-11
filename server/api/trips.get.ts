import { findTrips } from "~/lib/db/queries/trip";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  return findTrips(event.context.db, event.context.user.id);
});
