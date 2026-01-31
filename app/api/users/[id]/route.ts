import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user.service";
import {
	authenticateRequest,
	unauthorizedResponse,
	forbiddenResponse,
} from "@/lib/auth-utils";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const authResult = await authenticateRequest(request);

		if (!authResult.isAuthenticated) {
			return unauthorizedResponse();
		}

		const { id } = await params;

		// For user access, only allow accessing own user data
		if (!authResult.isSystemAccess && authResult.userId !== id) {
			return forbiddenResponse();
		}

		const user = await UserService.getUserById(id);
		return NextResponse.json({ data: user });
	} catch (error: any) {
		if (error.message === "User not found") {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}
		console.error("Error fetching user:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const authResult = await authenticateRequest(request);

		if (!authResult.isAuthenticated) {
			return unauthorizedResponse();
		}

		const { id } = await params;

		// For user access, only allow updating own user data
		if (!authResult.isSystemAccess && authResult.userId !== id) {
			return forbiddenResponse();
		}

		const { name, email, emailVerified, image } = await request.json();

		const user = await UserService.updateUser(id, {
			name,
			email,
			emailVerified,
			image,
		});

		return NextResponse.json({ data: user });
	} catch (error: any) {
		if (error.message === "User not found") {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}
		if (error.message === "User with this email already exists") {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 409 },
			);
		}
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const authResult = await authenticateRequest(request);

		if (!authResult.isAuthenticated) {
			return unauthorizedResponse();
		}

		const { id } = await params;

		// For user access, only allow deleting own user data
		if (!authResult.isSystemAccess && authResult.userId !== id) {
			return forbiddenResponse();
		}

		await UserService.deleteUser(id);
		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error: any) {
		if (error.message === "User not found") {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 },
		);
	}
}
