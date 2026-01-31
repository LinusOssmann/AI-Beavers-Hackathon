import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { travelStore } from "@/lib/mcp-travel-store";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const coordinatesSchema = {
  latitude: z.number(),
  longitude: z.number(),
};

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_activity_candidates",
      {
        title: "List Activity Candidates",
        description:
          "Returns the current activity candidates for a location, including their IDs.",
        inputSchema: {
          location_id: z.string().min(1),
        },
      },
      async ({ location_id }) => {
        const candidates = await travelStore.listActivityCandidates(location_id);
        const text = JSON.stringify(candidates, null, 2);
        return { content: [{ type: "text", text }] };
      }
    );

    server.registerTool(
      "add_activity_candidate",
      {
        title: "Add Activity Candidate",
        description: "Adds a single activity candidate to a location. Returns the new candidate ID.",
        inputSchema: {
          location_id: z.string().min(1),
          activity_name: z.string().min(1),
          activity_coordinates: z.object(coordinatesSchema),
          reason: z.string(),
          price_estimate: z.number(),
        },
      },
      async ({
        location_id,
        activity_name,
        activity_coordinates,
        reason,
        price_estimate,
      }) => {
        const id = await travelStore.addActivityCandidate(
          location_id,
          activity_name,
          activity_coordinates,
          reason,
          price_estimate
        );
        return { content: [{ type: "text", text: JSON.stringify({ id }) }] };
      }
    );

    server.registerTool(
      "list_accommodation_candidates",
      {
        title: "List Accommodation Candidates",
        description:
          "Returns the current accommodation candidates for a location, including their IDs.",
        inputSchema: {
          location_id: z.string().min(1),
        },
      },
      async ({ location_id }) => {
        const candidates =
          await travelStore.listAccommodationCandidates(location_id);
        const text = JSON.stringify(candidates, null, 2);
        return { content: [{ type: "text", text }] };
      }
    );

    server.registerTool(
      "add_accommodation_candidate",
      {
        title: "Add Accommodation Candidate",
        description:
          "Adds a single accommodation candidate to a location. Returns the new candidate ID.",
        inputSchema: {
          location_id: z.string().min(1),
          accommodation_name: z.string().min(1),
          accommodation_type: z.string().min(1),
          accommodation_coordinates: z.object(coordinatesSchema),
          reason: z.string(),
          price_estimate_per_night: z.number(),
        },
      },
      async ({
        location_id,
        accommodation_name,
        accommodation_type,
        accommodation_coordinates,
        reason,
        price_estimate_per_night,
      }) => {
        const id = await travelStore.addAccommodationCandidate(
          location_id,
          accommodation_name,
          accommodation_type,
          accommodation_coordinates,
          reason,
          price_estimate_per_night
        );
        return { content: [{ type: "text", text: JSON.stringify({ id }) }] };
      }
    );

    server.registerTool(
      "add_clarifying_question",
      {
        title: "Add Clarifying Question",
        description:
          "Adds a clarifying question to a location. The question is saved for later and not answered immediately.",
        inputSchema: {
          location_id: z.string().min(1),
          question: z.string().min(1),
        },
      },
      async ({ location_id, question }) => {
        const id = travelStore.addClarifyingQuestion(location_id, question);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id,
                message: "Clarifying question saved for later.",
              }),
            },
          ],
        };
      }
    );

    server.registerTool(
      "add_destination",
      {
        title: "Add Destination",
        description:
          "Adds a destination (location) to a travel plan. Returns the new destination ID.",
        inputSchema: {
          plan_id: z.string().min(1),
          name: z.string().min(1),
          country: z.string().min(1),
          city: z.string().optional(),
          coordinates: z.object(coordinatesSchema).optional(),
          description: z.string().optional(),
        },
      },
      async ({
        plan_id,
        name,
        country,
        city,
        coordinates,
        description,
      }) => {
        const id = await travelStore.addDestination(
          plan_id,
          name,
          country,
          city,
          coordinates,
          description
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ id }),
            },
          ],
        };
      }
    );
  },
  {},
  {
    streamableHttpEndpoint: "/mcp",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === "development",
  }
);

async function withCors(
  request: Request,
  handler: (req: Request) => Promise<Response>
): Promise<Response> {
  const response = await handler(request);
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  return withCors(request, mcpHandler);
}

export async function POST(request: Request) {
  return withCors(request, mcpHandler);
}
