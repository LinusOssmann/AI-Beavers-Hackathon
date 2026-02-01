import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
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

	// Transform user data
	const userData = {
		id: user.id,
		name: user.name,
		email: user.email,
		preferences: user.preferences as
			| {
					travelStyles?: string[];
					budget?: string;
					tripLength?: string;
					companion?: string;
					departureLocation?: string;
			  }
			| undefined,
		plans: user.plans.map((plan) => ({
			id: plan.id,
			title: plan.title,
			description: plan.description || undefined,
			startDate: plan.startDate || undefined,
			endDate: plan.endDate || undefined,
			createdAt: plan.createdAt,
			updatedAt: plan.updatedAt,
		})),
	};

	return <Dashboard user={userData} />;
}
