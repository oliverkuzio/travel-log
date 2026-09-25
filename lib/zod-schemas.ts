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
