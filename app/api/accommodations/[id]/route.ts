import { NextRequest, NextResponse } from "next/server";
import { AccommodationService } from "@/lib/services/accommodation.service";
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
			const hasAccess =
				await AccommodationService.validateAccommodationOwnership(
					id,
					authResult.userId,
				);
			if (!hasAccess) {
				return forbiddenResponse();
			}
		}

		const accommodation =
			await AccommodationService.getAccommodationById(id);
		return NextResponse.json({ data: accommodation });
	} catch (error: any) {
		if (error.message === "Accommodation not found") {
			return NextResponse.json(
				{ error: "Accommodation not found" },
				{ status: 404 },
			);
		}
		console.error("Error fetching accommodation:", error);
		return NextResponse.json(
			{ error: "Failed to fetch accommodation" },
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
			const hasAccess =
				await AccommodationService.validateAccommodationOwnership(
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
			checkIn,
			checkOut,
			isSelected,
			locationId,
			planId,
		} = await request.json();

		const accommodation = await AccommodationService.updateAccommodation(
			id,
			{
				name,
				type,
				address,
				price,
				rating,
				description,
				checkIn: checkIn ? new Date(checkIn) : null,
				checkOut: checkOut ? new Date(checkOut) : null,
				isSelected,
				locationId,
				planId,
			},
		);

		return NextResponse.json({ data: accommodation });
	} catch (error: any) {
		if (error.message === "Accommodation not found") {
			return NextResponse.json(
				{ error: "Accommodation not found" },
				{ status: 404 },
			);
		}
		if (
			error.message === "Plan or location not found" ||
			error.message === "Location does not belong to the specified plan"
		) {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		console.error("Error updating accommodation:", error);
		return NextResponse.json(
			{ error: "Failed to update accommodation" },
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
			const hasAccess =
				await AccommodationService.validateAccommodationOwnership(
					id,
					authResult.userId,
				);
			if (!hasAccess) {
				return forbiddenResponse();
			}
		}

		await AccommodationService.deleteAccommodation(id);
		return NextResponse.json({
			message: "Accommodation deleted successfully",
		});
	} catch (error: any) {
		if (error.message === "Accommodation not found") {
			return NextResponse.json(
				{ error: "Accommodation not found" },
				{ status: 404 },
			);
		}
		console.error("Error deleting accommodation:", error);
		return NextResponse.json(
			{ error: "Failed to delete accommodation" },
			{ status: 500 },
		);
	}
}
