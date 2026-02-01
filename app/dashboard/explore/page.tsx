/**
 * Explore page: location suggestions feed for the authenticated user.
 * Loads the latest plan and locations and passes them to SuggestionsFeed.
 */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SuggestionsFeed } from "@/components/feed/suggestions-feed";
import { prisma } from "@/prisma/prisma";

export default async function ExplorePage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/sign-in");

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			preferences: true,
		},
	});

	if (!user) redirect("/");

	// Get user's most recent plan (if any) to show existing suggestions
	const latestPlan = await prisma.plan.findFirst({
		where: { userId: session.user.id },
		orderBy: { createdAt: "desc" },
		include: {
			locations: {
				orderBy: { createdAt: "desc" },
			},
		},
	});

	return (
		<SuggestionsFeed
			userId={session.user.id}
			userPreferences={user.preferences as any}
			existingPlanId={latestPlan?.id}
			initialLocations={latestPlan?.locations || []}
		/>
	);
}
