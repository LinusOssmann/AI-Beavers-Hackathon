import { NextRequest, NextResponse } from "next/server";
import { ActivityService } from "@/lib/services/activity.service";
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

		// Validate ownership for user requests
		if (!authResult.isSystemAccess) {
			const hasAccess = await ActivityService.validateActivityOwnership(
				id,
				authResult.userId,
			);
			if (!hasAccess) {
				return forbiddenResponse();
			}
		}

		const activity = await ActivityService.getActivityById(id);
		return NextResponse.json({ data: activity });
	} catch (error: any) {
		if (error.message === "Activity not found") {
			return NextResponse.json(
				{ error: "Activity not found" },
				{ status: 404 },
			);
		}
		console.error("Error fetching activity:", error);
		return NextResponse.json(
			{ error: "Failed to fetch activity" },
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

		// Validate ownership for user requests
		if (!authResult.isSystemAccess) {
			const hasAccess = await ActivityService.validateActivityOwnership(
				id,
				authResult.userId,
			);
			if (!hasAccess) {
				return forbiddenResponse();
			}
		}

		const {
			name,
			type,
			address,
			price,
			rating,
			description,
			duration,
			isSelected,
			locationId,
			planId,
		} = await request.json();

		const activity = await ActivityService.updateActivity(id, {
			name,
			type,
			address,
			price,
			rating,
			description,
			duration,
			isSelected,
			locationId,
			planId,
		});

		return NextResponse.json({ data: activity });
	} catch (error: any) {
		if (error.message === "Activity not found") {
			return NextResponse.json(
				{ error: "Activity not found" },
				{ status: 404 },
			);
		}
		if (
			error.message === "Plan or location not found" ||
			error.message === "Location does not belong to the specified plan"
		) {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		console.error("Error updating activity:", error);
		return NextResponse.json(
			{ error: "Failed to update activity" },
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

		// Validate ownership for user requests
		if (!authResult.isSystemAccess) {
			const hasAccess = await ActivityService.validateActivityOwnership(
				id,
				authResult.userId,
			);
			if (!hasAccess) {
				return forbiddenResponse();
			}
		}

		await ActivityService.deleteActivity(id);
		return NextResponse.json({ message: "Activity deleted successfully" });
	} catch (error: any) {
		if (error.message === "Activity not found") {
			return NextResponse.json(
				{ error: "Activity not found" },
				{ status: 404 },
			);
		}
		console.error("Error deleting activity:", error);
		return NextResponse.json(
			{ error: "Failed to delete activity" },
			{ status: 500 },
		);
	}
}
