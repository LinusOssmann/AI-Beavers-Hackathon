/**
 * Zod schemas for validating data received from the Manus model (API response).
 * We do not validate outbound DTOs – user and plan data come from the database (Prisma).
 */

import { z } from "zod";

/** Single destination suggestion returned by the model. */
export const destinationSuggestionSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  city: z.string().optional(),
  reason: z.string().optional(),
});

/** Array of up to 3 destination suggestions (model response). */
export const destinationSuggestionsResponseSchema = z
  .array(destinationSuggestionSchema)
  .max(3);

export type DestinationSuggestion = z.infer<typeof destinationSuggestionSchema>;

/**
 * Validates and normalizes the parsed model output.
 * Returns only items that pass validation (0–3 items).
 */
export function validateDestinationSuggestionsResponse(
  parsed: unknown
): DestinationSuggestion[] {
  if (!Array.isArray(parsed)) return [];
  const result: DestinationSuggestion[] = [];
  for (let i = 0; i < Math.min(parsed.length, 3); i++) {
    const item = destinationSuggestionSchema.safeParse(parsed[i]);
    if (item.success) result.push(item.data);
  }
  return result;
}
