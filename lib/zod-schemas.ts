import { z } from "zod";

export const SearchSchema = z.object({
  q: z.string().min(1, "You must enter a search term."),
});

export type SearchSchema = z.infer<typeof SearchSchema>;

export const NameSchema = z.string().min(1).max(100);
export const DescriptionSchema = z.string().min(1).max(1000).or(z.null());
export const IconSchema = z.string().min(1).max(100).regex(/^tabler:[a-z0-9-]+$/, "Icon must be a tabler icon, e.g. tabler:beer");
export const IdSchema = z.number().int().positive();
export const LatSchema = z.number().min(-90).max(90);
export const LongSchema = z.number().min(-180).max(180);
const GOOGLE_TLD = String.raw`(?:com|co\.[a-z]{2}|com\.[a-z]{2}|[a-z]{2})`;
const GOOGLE_MAPS_URL_REGEX = new RegExp(String.raw`^https:\/\/(?:(?:www\.)?google\.${GOOGLE_TLD}\/maps(?:[/?#]|$)|maps\.google\.${GOOGLE_TLD}(?:[/?#]|$)|maps\.app\.goo\.gl\/|goo\.gl\/maps\/)`, "i");

export const GoogleMapsUrlSchema = z.preprocess(
  value => typeof value === "string" && value.trim() === "" ? null : value,
  z.string()
    .trim()
    .max(2048)
    .url("Must be a valid URL.")
    .regex(GOOGLE_MAPS_URL_REGEX, "Must be a Google Maps link, e.g. https://maps.app.goo.gl/...")
    .nullable(),
);
export const DateSchema = z.number({
  message: "Date is required",
});

export function refineDates(values: { startedAt: number; endedAt: number }, context: z.RefinementCtx) {
  if (values.startedAt > values.endedAt) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start Date must be before End Date",
      path: ["startedAt"],
    });

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End Date must be after Start Date",
      path: ["endedAt"],
    });
  }
}
