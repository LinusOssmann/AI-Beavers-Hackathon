import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-utils";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ locationId: string }> },
) {
	try {
		const authResult = await authenticateRequest(request);
		if (!authResult.isAuthenticated) {
			return unauthorizedResponse();
		}

		const { locationId } = await params;
		const location = await prisma.location.findUnique({
			where: { id: locationId },
			include: {
				plan: { select: { userId: true } },
				accommodations: true,
				activities: true,
				transports: true,
			},
		});

		if (!location) {
			return NextResponse.json({ error: "Location not found." }, { status: 404 });
		}

		if (
			authResult.userId !== null &&
			location.plan.userId !== authResult.userId
		) {
			return NextResponse.json(
				{ error: "Forbidden - you can only access your own locations." },
				{ status: 403 },
			);
		}

		return NextResponse.json(location);
	} catch (error) {
		return NextResponse.json(
			{ error: "There was an error fetching that location." },
			{ status: 500 },
		);
	}
}
