import { z } from "zod";

export const SearchSchema = z.object({
  q: z.string().min(1, "You must enter a search term."),
});

export type SearchSchema = z.infer<typeof SearchSchema>;

export const NameSchema = z.string().min(1).max(100);
export const DescriptionSchema = z.string().min(1).max(1000).or(z.null());
export const IconSchema = z.string().min(1).max(100);
export const LatSchema = z.number().min(-90).max(90);
export const LongSchema = z.number().min(-180).max(180);
export const DateSchema = z.number({
  message: "Date is required",
});
