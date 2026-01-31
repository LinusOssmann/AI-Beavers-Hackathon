import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * Dual authentication: supports both user sessions and API key authentication
 * Returns userId for user requests, null for system/agent requests
 */
export async function authenticateRequest(request: NextRequest): Promise<{
	isAuthenticated: boolean;
	isSystemAccess: boolean; // true for API key, false for user session
	userId: string | null; // null for system access, userId for user access
	user?: any;
}> {
	// Check for API key first (for MCP/agent requests)
	const apiKey =
		request.headers.get("x-api-key") ||
		request.headers.get("authorization")?.replace("Bearer ", "");

	if (apiKey) {
		const isValidApiKey = apiKey === process.env.MCP_API_KEY;
		return {
			isAuthenticated: isValidApiKey,
			isSystemAccess: isValidApiKey,
			userId: null, // System access - no specific user
		};
	}

	// Check for user session (for regular user requests)
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session) {
		return {
			isAuthenticated: false,
			isSystemAccess: false,
			userId: null,
		};
	}

	return {
		isAuthenticated: true,
		isSystemAccess: false,
		userId: session.user.id,
		user: session.user,
	};
}

export function unauthorizedResponse() {
	return Response.json(
		{
			error: "Unauthorized - authentication required (user session or API key)",
		},
		{ status: 401 },
	);
}

export function forbiddenResponse() {
	return Response.json(
		{ error: "Forbidden - insufficient permissions" },
		{ status: 403 },
	);
}
