import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { Dashboard } from "@/components/dashboard/dashboard";

export default async function DashboardPage() {
	// #region agent log
	fetch("http://127.0.0.1:7243/ingest/408aa5f2-1708-45ac-98c2-9632a0b8ce7d", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "app/dashboard/page.tsx:9",
			message: "DashboardPage entry",
			data: {},
			timestamp: Date.now(),
			sessionId: "debug-session",
			hypothesisId: "H2",
		}),
	}).catch(() => {});
	// #endregion

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// #region agent log
	fetch("http://127.0.0.1:7243/ingest/408aa5f2-1708-45ac-98c2-9632a0b8ce7d", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "app/dashboard/page.tsx:17",
			message: "Session retrieved",
			data: { hasSession: !!session, userId: session?.user?.id },
			timestamp: Date.now(),
			sessionId: "debug-session",
			hypothesisId: "H2",
		}),
	}).catch(() => {});
	// #endregion

	if (!session) {
		// #region agent log
		fetch(
			"http://127.0.0.1:7243/ingest/408aa5f2-1708-45ac-98c2-9632a0b8ce7d",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					location: "app/dashboard/page.tsx:21",
					message: "No session - redirecting",
					data: {},
					timestamp: Date.now(),
					sessionId: "debug-session",
					hypothesisId: "H2",
				}),
			},
		).catch(() => {});
		// #endregion
		redirect("/");
	}

	// #region agent log
	fetch("http://127.0.0.1:7243/ingest/408aa5f2-1708-45ac-98c2-9632a0b8ce7d", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "app/dashboard/page.tsx:27",
			message: "Fetching user from DB",
			data: { userId: session.user.id },
			timestamp: Date.now(),
			sessionId: "debug-session",
			hypothesisId: "H3",
		}),
	}).catch(() => {});
	// #endregion

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: {
			plans: {
				orderBy: { updatedAt: "desc" },
				take: 10,
			},
		},
	});

	// #region agent log
	fetch("http://127.0.0.1:7243/ingest/408aa5f2-1708-45ac-98c2-9632a0b8ce7d", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "app/dashboard/page.tsx:39",
			message: "User fetched",
			data: {
				hasUser: !!user,
				onboardingComplete: user?.onboardingComplete,
				planCount: user?.plans?.length,
			},
			timestamp: Date.now(),
			sessionId: "debug-session",
			hypothesisId: "H3",
		}),
	}).catch(() => {});
	// #endregion

	if (!user) {
		redirect("/");
	}

	// Check if user has completed onboarding
	if (!user.onboardingComplete) {
		// #region agent log
		fetch(
			"http://127.0.0.1:7243/ingest/408aa5f2-1708-45ac-98c2-9632a0b8ce7d",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					location: "app/dashboard/page.tsx:48",
					message: "Showing onboarding",
					data: { userId: session.user.id },
					timestamp: Date.now(),
					sessionId: "debug-session",
					hypothesisId: "H5",
				}),
			},
		).catch(() => {});
		// #endregion
		return <OnboardingFlow userId={session.user.id} />;
	}

	return <Dashboard user={user} />;
}
