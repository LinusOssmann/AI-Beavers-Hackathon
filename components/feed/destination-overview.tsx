"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type {
	Location,
	Accommodation,
	Activity,
	Transport,
} from "@/generated/prisma/client";

interface LocationWithResearch extends Location {
	accommodations: Accommodation[];
	activities: Activity[];
	transports: Transport[];
}

interface DestinationOverviewProps {
	initialLocation: LocationWithResearch;
}

export function DestinationOverview({ initialLocation }: DestinationOverviewProps) {
	const [location, setLocation] = useState<LocationWithResearch>(initialLocation);
	const unchangedPollsRef = useRef(0);
	const signatureRef = useRef("");

	useEffect(() => {
		let isActive = true;

		const pollLocation = async () => {
			try {
				const response = await fetch(`/api/locations/${location.id}`);
				if (!response.ok) return;
				const nextLocation = (await response.json()) as LocationWithResearch;
				if (!isActive) return;

				const signature = `${nextLocation.updatedAt}:${nextLocation.accommodations.length}:${nextLocation.activities.length}:${nextLocation.transports.length}`;
				if (signature === signatureRef.current) {
					unchangedPollsRef.current += 1;
				} else {
					signatureRef.current = signature;
					unchangedPollsRef.current = 0;
				}

				setLocation(nextLocation);

				const hasResearch =
					nextLocation.accommodations.length > 0 ||
					nextLocation.activities.length > 0 ||
					nextLocation.transports.length > 0;
				if (hasResearch && unchangedPollsRef.current >= 3) {
					isActive = false;
				}
			} catch (error) {
				console.error("Failed to refresh location:", error);
			}
		};

		pollLocation();
		const pollInterval = setInterval(pollLocation, 8000);

		return () => {
			isActive = false;
			clearInterval(pollInterval);
		};
	}, [location.id]);

	return (
		<div className="flex-1 px-8 md:px-16 lg:px-24 xl:px-32 overflow-y-auto py-8">
			<div className="max-w-[1200px] mx-auto space-y-8">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold text-foreground">
							{location.name}
						</h1>
						<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
							<MapPin className="w-3.5 h-3.5" />
							<span>
								{location.city ? `${location.city}, ` : ""}
								{location.country}
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

				{location.description && (
					<p className="text-muted-foreground leading-relaxed">
						{location.description}
					</p>
				)}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="rounded-lg border border-border bg-card p-4">
						<p className="text-xs text-muted-foreground">Accommodations</p>
						<p className="text-2xl font-semibold text-foreground">
							{location.accommodations.length}
						</p>
					</div>
					<div className="rounded-lg border border-border bg-card p-4">
						<p className="text-xs text-muted-foreground">Activities</p>
						<p className="text-2xl font-semibold text-foreground">
							{location.activities.length}
						</p>
					</div>
					<div className="rounded-lg border border-border bg-card p-4">
						<p className="text-xs text-muted-foreground">Transports</p>
						<p className="text-2xl font-semibold text-foreground">
							{location.transports.length}
						</p>
					</div>
				</div>

				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-foreground">
						Accommodations
					</h2>
					{location.accommodations.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No accommodations yet. Research is still running.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{location.accommodations.map((item) => (
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
					{location.activities.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No activities yet. Research is still running.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{location.activities.map((item) => (
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
					{location.transports.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No transport options yet. Research is still running.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{location.transports.map((item) => (
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
