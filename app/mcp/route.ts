import { travelStore } from "@/lib/mcp-travel-store";
import * as accommodationService from "@/lib/services/accommodation.service";
import * as activityService from "@/lib/services/activity.service";
import * as locationService from "@/lib/services/location.service";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

function toolError(message: string) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify({ error: message }) },
    ],
  };
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "listActivityCandidates",
      {
        title: "List Activity Candidates",
        description:
          "This tool returns the current activity candidates for a location, including their IDs.",
        inputSchema: {
          locationId: z.string().min(1),
        },
      },
      async ({ locationId }) => {
        try {
          const candidates = await activityService.listActivitiesByLocation(
            locationId
          );
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(candidates, null, 2),
              },
            ],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return toolError(message);
        }
      }
    );

    server.registerTool(
      "addActivityCandidate",
      {
        title: "Add Activity Candidate",
        description:
          "Adds a single activity candidate to a location. Returns the new candidate ID.",
        inputSchema: {
          locationId: z.string().min(1),
          activityName: z.string().min(1),
          activityCoordinates: coordinatesSchema,
          reason: z.string(),
          priceEstimate: z.number(),
        },
      },
      async ({ locationId, activityName, reason, priceEstimate }) => {
        try {
          const id = await activityService.createActivity(
            locationId,
            activityName,
            reason,
            priceEstimate
          );
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ id }) }],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return toolError(message);
        }
      }
    );

    server.registerTool(
      "listAccommodationCandidates",
      {
        title: "List Accommodation Candidates",
        description:
          "This tool returns the current accommodation candidates for a location, including their IDs.",
        inputSchema: {
          locationId: z.string().min(1),
        },
      },
      async ({ locationId }) => {
        try {
          const candidates =
            await accommodationService.listAccommodationsByLocation(locationId);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(candidates, null, 2),
              },
            ],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return toolError(message);
        }
      }
    );

    server.registerTool(
      "addAccommodationCandidate",
      {
        title: "Add Accommodation Candidate",
        description:
          "Adds a single accommodation candidate to a location. Returns the new candidate ID.",
        inputSchema: {
          locationId: z.string().min(1),
          accommodationName: z.string().min(1),
          accommodationType: z.string().min(1),
          accommodationCoordinates: coordinatesSchema,
          reason: z.string(),
          priceEstimatePerNight: z.number(),
        },
      },
      async ({
        locationId,
        accommodationName,
        accommodationType,
        reason,
        priceEstimatePerNight,
      }) => {
        try {
          const id = await accommodationService.createAccommodation(
            locationId,
            accommodationName,
            accommodationType,
            reason,
            priceEstimatePerNight
          );
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ id }) }],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return toolError(message);
        }
      }
    );

    server.registerTool(
      "addClarifyingQuestion",
      {
        title: "Add Clarifying Question",
        description:
          "Adds a clarifying question to a location. The question is saved for later and not answered immediately.",
        inputSchema: {
          locationId: z.string().min(1),
          question: z.string().min(1),
        },
      },
      async ({ locationId, question }) => {
        try {
          const id = travelStore.addClarifyingQuestion(locationId, question);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  id,
                  message: "Clarifying question saved for later.",
                }),
              },
            ],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return toolError(message);
        }
      }
    );

    server.registerTool(
      "addDestination",
      {
        title: "Add Destination",
        description:
          "Adds a destination (location) to a travel plan. Returns the new destination ID.",
        inputSchema: {
          planId: z.string().min(1),
          name: z.string().min(1),
          country: z.string().min(1),
          city: z.string().optional(),
          coordinates: coordinatesSchema.optional(),
          description: z.string().optional(),
        },
      },
      async ({ planId, name, country, city, coordinates, description }) => {
        try {
          const id = await locationService.createLocation(
            planId,
            name,
            country,
            city ?? null,
            coordinates
              ? {
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                }
              : null,
            description ?? null
          );
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ id }) }],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return toolError(message);
        }
      }
    );
  },
  {},
  {
    basePath: "",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === "development",
    disableSse: true,
  }
);

async function withCors(
  request: Request,
  fn: (req: Request) => Promise<Response>
): Promise<Response> {
  const response = await fn(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  return withCors(request, handler);
}

export async function POST(request: Request) {
  return withCors(request, handler);
}
