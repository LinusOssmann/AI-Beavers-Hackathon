import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma";
import { Compass } from "lucide-react";

export default async function ItinerariesPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/sign-in");

	const plans = await prisma.plan.findMany({
		where: { userId: session.user.id },
		orderBy: { updatedAt: "desc" },
		include: {
			locations: {
				where: { isSelected: true },
				take: 1,
			},
		},
	});

	return (
		<div className="flex-1 px-8 md:px-16 lg:px-24 xl:px-32 overflow-y-auto py-8">
			<div className="max-w-[1400px] mx-auto">
				<div className="mb-8">
					<h1 className="text-2xl font-semibold text-foreground">
						My Itineraries
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{plans.length}{" "}
						{plans.length === 1 ? "itinerary" : "itineraries"} generated
					</p>
				</div>

				{plans.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{plans.map((plan) => (
							<a
								key={plan.id}
								href={`/dashboard/explore?planId=${plan.id}`}
								className="block bg-card border border-border rounded-md p-4 hover:shadow-md transition-all"
							>
								<h3 className="font-bold text-lg mb-2">{plan.title}</h3>
								{plan.description && (
									<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
										{plan.description}
									</p>
								)}
								{plan.locations[0] && (
									<p className="text-xs text-primary">
										{plan.locations[0].name}, {plan.locations[0].country}
									</p>
								)}
								<p className="text-xs text-muted-foreground mt-2">
									Updated {new Date(plan.updatedAt).toLocaleDateString()}
								</p>
							</a>
						))}
					</div>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center py-16">
						<div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
							<Compass className="w-8 h-8 text-muted-foreground" />
						</div>
						<h2 className="text-xl font-semibold text-foreground mb-2">
							No itineraries yet
						</h2>
						<p className="text-muted-foreground text-center max-w-xs">
							Generate your first trip to see it here.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
