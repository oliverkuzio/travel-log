import type { InsertLocation } from "~/lib/db/schema";
import type { CoverImageChange } from "~/lib/types";

/**
 * Sends the location as JSON, or as multipart form data when the cover photo is being changed.
 */
export default function locationRequestBody(location: InsertLocation, coverImage?: CoverImageChange) {
  if (!coverImage) {
    return location;
  }

  const formData = new FormData();
  formData.append("data", JSON.stringify(location));

  if (coverImage === "remove") {
    formData.append("removeCoverImage", "true");
  }
  else {
    formData.append("coverImage", coverImage, "cover.jpg");
  }

  return formData;
}
