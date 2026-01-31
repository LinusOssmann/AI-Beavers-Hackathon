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

// Accommodations
export const accommodationSuggestionSchema = z.object({
  name: z.string().min(1).describe("The name of the accommodation."),
  type: z
    .enum(["Hotel", "Hostel", "Apartment", "BnB", "Resort", "Other"])
    .describe("The type of accommodation."),
  city: z
    .string()
    .min(1)
    .describe("The city where the accommodation is located."),
  country: z.string().min(1).describe("The country of the accommodation."),
  priceRange: z
    .enum(["Budget", "Comfortable", "Premium"])
    .optional()
    .describe("The price range of the accommodation."),
  rating: z
    .number()
    .min(0)
    .max(5)
    .optional()
    .describe("The average rating of the accommodation if known."),
  reason: z
    .string()
    .optional()
    .describe(
      "The reason for the suggestion, e.g. value, location, or fit with user preferences."
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("The relevance score of the accommodation for the user."),
});

export const accommodationSuggestionsResponseSchema = z
  .array(accommodationSuggestionSchema)
  .max(3);

export type AccommodationSuggestion = z.infer<
  typeof accommodationSuggestionSchema
>;

// Activities
export const activitySuggestionSchema = z.object({
  name: z.string().min(1).describe("The name of the activity."),
  type: z
    .enum([
      "Attraction",
      "Restaurant",
      "Experience",
      "Tour",
      "Nightlife",
      "Other",
    ])
    .describe("The type of activity."),
  city: z.string().min(1).describe("The city where the activity is located."),
  country: z.string().min(1).describe("The country of the activity."),
  duration: z
    .string()
    .optional()
    .describe("The estimated duration of the activity."),
  priceRange: z
    .enum(["Budget", "Comfortable", "Premium"])
    .optional()
    .describe("The price range of the activity."),
  reason: z
    .string()
    .optional()
    .describe(
      "The reason for the suggestion, e.g. popularity, fit with interests, or timing."
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("The relevance score of the activity for the user."),
});

export const activitySuggestionsResponseSchema = z
  .array(activitySuggestionSchema)
  .max(3);

export type ActivitySuggestion = z.infer<typeof activitySuggestionSchema>;

// Transports
export const transportSuggestionSchema = z.object({
  type: z
    .enum(["Flight", "Train", "Bus", "Car", "Ferry", "Other"])
    .describe("The type of transport option."),
  from: z.string().min(1).describe("The origin city or location."),
  to: z.string().min(1).describe("The destination city or location."),
  duration: z
    .string()
    .optional()
    .describe("The estimated duration of the transport option."),
  priceRange: z
    .enum(["Budget", "Comfortable", "Premium"])
    .optional()
    .describe("The price range for this transport option."),
  reason: z
    .string()
    .optional()
    .describe(
      "The reason for the suggestion, e.g. speed, cost, convenience, or scenery."
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("The relevance score of the transport option for the user."),
});

export const transportSuggestionsResponseSchema = z
  .array(transportSuggestionSchema)
  .max(3);

export type TransportSuggestion = z.infer<typeof transportSuggestionSchema>;
