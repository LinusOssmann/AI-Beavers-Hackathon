import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user.service";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
	try {
		const authResult = await authenticateRequest(request);

		if (!authResult.isAuthenticated) {
			return unauthorizedResponse();
		}

		const { searchParams } = request.nextUrl;
		const email = searchParams.get("email");
		const limit = searchParams.get("limit");
		const offset = searchParams.get("offset");

		// If system access (API key), return all users
		// If user access (session), return only the authenticated user
		const result = await UserService.getUsers({
			userId: authResult.userId, // null for system, userId for user (self only)
			email: email ?? undefined,
			limit: limit ? Number(limit) : undefined,
			offset: offset ? Number(offset) : undefined,
		});

		return NextResponse.json({ data: result.users, total: result.total });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 },
		);
	}
}

// POST removed - users are created via Better Auth registration
// Keeping this endpoint would bypass authentication security
