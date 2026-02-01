import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { MapPin } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import type {
	Location,
	Accommodation,
	Activity,
	Transport,
} from "@/generated/prisma/client";

interface DestinationOverviewPageProps {
	params: { planId: string };
	searchParams?: { locationId?: string };
}

interface LocationWithResearch extends Location {
	accommodations: Accommodation[];
	activities: Activity[];
	transports: Transport[];
}

export default async function DestinationOverviewPage({
	params,
	searchParams,
}: DestinationOverviewPageProps) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/sign-in");

	const plan = await prisma.plan.findUnique({
		where: { id: params.planId },
		include: {
			locations: {
				include: {
					accommodations: true,
					activities: true,
					transports: true,
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	if (!plan) notFound();
	if (plan.userId !== session.user.id) notFound();

	const locations = plan.locations as LocationWithResearch[];
	const preferredLocation =
		(searchParams?.locationId &&
			locations.find((location) => location.id === searchParams.locationId)) ||
		locations.find((location) => location.isSelected) ||
		locations[0];

	if (!preferredLocation) {
		return (
			<div className="flex-1 px-8 md:px-16 lg:px-24 xl:px-32 overflow-y-auto py-8">
				<div className="max-w-[1200px] mx-auto space-y-4">
					<h1 className="text-2xl font-semibold text-foreground">
						No destination selected yet
					</h1>
					<p className="text-muted-foreground">
						Pick a destination to view all suggestions.
					</p>
					<Link
						href="/dashboard/explore"
						className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
					>
						Back to suggestions
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 px-8 md:px-16 lg:px-24 xl:px-32 overflow-y-auto py-8">
			<div className="max-w-[1200px] mx-auto space-y-8">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold text-foreground">
							{preferredLocation.name}
						</h1>
						<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
							<MapPin className="w-3.5 h-3.5" />
							<span>
								{preferredLocation.city ? `${preferredLocation.city}, ` : ""}
								{preferredLocation.country}
							</span>
						</div>
					</div>
					<Link
						href="/dashboard/explore"
						className="text-sm font-medium text-primary hover:text-primary/80"
					>
						Back to suggestions
					</Link>
				</div>

				{preferredLocation.description && (
					<p className="text-muted-foreground leading-relaxed">
						{preferredLocation.description}
					</p>
				)}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="rounded-lg border border-border bg-card p-4">
						<p className="text-xs text-muted-foreground">Accommodations</p>
						<p className="text-2xl font-semibold text-foreground">
							{preferredLocation.accommodations.length}
						</p>
					</div>
					<div className="rounded-lg border border-border bg-card p-4">
						<p className="text-xs text-muted-foreground">Activities</p>
						<p className="text-2xl font-semibold text-foreground">
							{preferredLocation.activities.length}
						</p>
					</div>
					<div className="rounded-lg border border-border bg-card p-4">
						<p className="text-xs text-muted-foreground">Transports</p>
						<p className="text-2xl font-semibold text-foreground">
							{preferredLocation.transports.length}
						</p>
					</div>
				</div>

				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-foreground">
						Accommodations
					</h2>
					{preferredLocation.accommodations.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No accommodations yet. Research is still running.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{preferredLocation.accommodations.map((item) => (
								<div
									key={item.id}
									className="rounded-lg border border-border bg-card p-4"
								>
									<p className="font-semibold text-foreground">{item.name}</p>
									<p className="text-sm text-muted-foreground">
										{item.type ?? "Accommodation"}
									</p>
									{item.price && (
										<p className="text-sm text-foreground mt-2">
											${item.price.toLocaleString()}
										</p>
									)}
									{item.url && (
										<a
											href={item.url}
											target="_blank"
											rel="noreferrer"
											className="text-xs text-primary hover:text-primary/80"
										>
											View details
										</a>
									)}
								</div>
							))}
						</div>
					)}
				</section>

				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-foreground">Activities</h2>
					{preferredLocation.activities.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No activities yet. Research is still running.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{preferredLocation.activities.map((item) => (
								<div
									key={item.id}
									className="rounded-lg border border-border bg-card p-4"
								>
									<p className="font-semibold text-foreground">{item.name}</p>
									<p className="text-sm text-muted-foreground">
										{item.type ?? "Activity"}
									</p>
									{item.url && (
										<a
											href={item.url}
											target="_blank"
											rel="noreferrer"
											className="text-xs text-primary hover:text-primary/80"
										>
											View details
										</a>
									)}
								</div>
							))}
						</div>
					)}
				</section>

				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-foreground">Transport</h2>
					{preferredLocation.transports.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No transport options yet. Research is still running.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{preferredLocation.transports.map((item) => (
								<div
									key={item.id}
									className="rounded-lg border border-border bg-card p-4"
								>
									<p className="font-semibold text-foreground">
										{item.name ?? item.type}
									</p>
									<p className="text-sm text-muted-foreground">{item.type}</p>
									{item.price && (
										<p className="text-sm text-foreground mt-2">
											${item.price.toLocaleString()}
										</p>
									)}
									{item.url && (
										<a
											href={item.url}
											target="_blank"
											rel="noreferrer"
											className="text-xs text-primary hover:text-primary/80"
										>
											View details
										</a>
									)}
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
