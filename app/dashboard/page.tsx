/**
 * Dashboard entry page.
 * Shows onboarding if incomplete; otherwise redirects to explore.
 */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			onboardingComplete: true,
		},
	});

	if (!user) {
		redirect("/");
	}

	// Check if user has completed onboarding
	if (!user.onboardingComplete) {
		return <OnboardingFlow userId={session.user.id} />;
	}

	// Redirect to explore page
	redirect("/dashboard/explore");
}

