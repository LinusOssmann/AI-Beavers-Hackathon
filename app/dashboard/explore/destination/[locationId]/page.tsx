import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { DestinationOverview } from "@/components/feed/destination-overview";

interface DestinationOverviewPageProps {
	params: { locationId: string };
}

export default async function DestinationOverviewPage({
	params,
}: DestinationOverviewPageProps) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/sign-in");
	if (!params.locationId || params.locationId === "undefined") {
		redirect("/dashboard/explore");
	}

	const location = await prisma.location.findUnique({
		where: { id: params.locationId },
		include: {
			plan: { select: { userId: true } },
			accommodations: true,
			activities: true,
			transports: true,
		},
	});

	if (!location) redirect("/dashboard/explore");
	if (location.plan.userId !== session.user.id) redirect("/dashboard/explore");

	const { plan: _plan, ...locationData } = location;

	return <DestinationOverview initialLocation={locationData} />;
}
