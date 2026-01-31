import { z } from "zod";

export const locationSuggestionSchema = z.object({
  name: z.string().min(1).describe("The name of the location."),
  country: z.string().min(1).describe("The country of the location."),
  city: z.string().optional().describe("The city of the location."),
  latitude: z.number().optional().describe("The latitude of the location."),
  longitude: z.number().optional().describe("The longitude of the location."),
  reason: z
    .string()
    .optional()
    .describe(
      "The reason for the location suggestion, such as why it might be a good fit, why it's good value or suits their time or other preferences."
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("The score of the location suggestion for the user."),
});

export const locationSuggestionsResponseSchema = z
  .array(locationSuggestionSchema)
  .max(3);

export type LocationSuggestion = z.infer<typeof locationSuggestionSchema>;
