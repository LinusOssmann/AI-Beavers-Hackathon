import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { Dashboard } from "@/components/dashboard/dashboard";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: {
			plans: {
				orderBy: { updatedAt: "desc" },
				take: 10,
			},
		},
	});

	if (!user) {
		redirect("/");
	}

	// Check if user has completed onboarding
	if (!user.onboardingComplete) {
		return <OnboardingFlow userId={session.user.id} />;
	}

	return <Dashboard user={user} />;
}
