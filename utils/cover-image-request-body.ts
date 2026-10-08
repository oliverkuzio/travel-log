import type { CoverImageChange } from "~/lib/types";

/**
 * Sends the values as JSON, or as multipart form data when the cover photo is being changed.
 */
export default function coverImageRequestBody<T extends object>(values: T, coverImage?: CoverImageChange) {
  if (!coverImage) {
    return values;
  }

  const formData = new FormData();
  formData.append("data", JSON.stringify(values));

  if (coverImage === "remove") {
    formData.append("removeCoverImage", "true");
  }
  else {
    formData.append("coverImage", coverImage, "cover.jpg");
  }

  return formData;
}
