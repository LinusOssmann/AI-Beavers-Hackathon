"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Compass } from "lucide-react";
import { Filters, type FilterState } from "./filters";
import { LocationCard } from "./location-card";
import type { Location } from "@/generated/prisma/client";

interface SuggestionsFeedProps {
	userId: string;
	userPreferences: any;
	existingPlanId?: string;
	initialLocations?: Location[];
}

const DEFAULT_FILTERS: FilterState = {
	destination: "",
	startDate: "",
	endDate: "",
	flexibleDates: false,
	budgetMin: 0,
	budgetMax: 10000,
	travelStyles: [],
	numberOfTravelers: 1,
	startingPoint: "",
	travelingWithPet: false,
	tripDurationMin: 1,
	tripDurationMax: 30,
};

export function SuggestionsFeed({
	userId,
	userPreferences,
	existingPlanId,
	initialLocations = [],
}: SuggestionsFeedProps) {
	const router = useRouter();
	const [planId, setPlanId] = useState<string | undefined>(existingPlanId);
	const [locations, setLocations] = useState<Location[]>(initialLocations);
	const [locationTaskId, setLocationTaskId] = useState<string | undefined>();
	const [researchTaskId, setResearchTaskId] = useState<string | undefined>();
	const [isGenerating, setIsGenerating] = useState(false);
	const [isPollingLocations, setIsPollingLocations] = useState(false);
	const [isPollingResearch, setIsPollingResearch] = useState(false);
	const [taskStatus, setTaskStatus] = useState("");
	const [appliedFilters, setAppliedFilters] =
		useState<FilterState>(DEFAULT_FILTERS);

	// Poll for location suggestions
	useEffect(() => {
		if (!isPollingLocations || !locationTaskId || !planId) return;

		const pollInterval = setInterval(async () => {
			try {
				const response = await fetch(
					`/check-status?responseId=${locationTaskId}`,
				);
				const data = await response.json();

				setTaskStatus(data.status);

				if (data.status === "completed") {
					setIsPollingLocations(false);
					// Fetch locations from database
					const planResponse = await fetch(`/api/plans/${planId}`);
					const plan = await planResponse.json();
					setLocations(plan.locations || []);
				} else if (data.status === "failed") {
					setIsPollingLocations(false);
					console.error("Location task failed:", data.error);
				}
			} catch (error) {
				console.error("Polling error:", error);
			}
		}, 3000);

		return () => clearInterval(pollInterval);
	}, [isPollingLocations, locationTaskId, planId]);

	// Poll for research results
	useEffect(() => {
		if (!isPollingResearch || !researchTaskId) return;

		const pollInterval = setInterval(async () => {
			try {
				const response = await fetch(
					`/check-status?responseId=${researchTaskId}`,
				);
				const data = await response.json();

				if (data.status === "completed") {
					setIsPollingResearch(false);
					// Navigate to trip detail or refresh
					router.refresh();
				} else if (data.status === "failed") {
					setIsPollingResearch(false);
					console.error("Research task failed:", data.error);
				}
			} catch (error) {
				console.error("Polling error:", error);
			}
		}, 3000);

		return () => clearInterval(pollInterval);
	}, [isPollingResearch, researchTaskId, router]);

	const handleGenerate = async () => {
		if (isGenerating || isPollingLocations) return;

		setIsGenerating(true);

		try {
			// Create a new plan
			const planResponse = await fetch("/api/plans", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: "My Trip",
					description: "AI-generated travel plan",
				}),
			});

			if (!planResponse.ok) throw new Error("Failed to create plan");

			const plan = await planResponse.json();
			setPlanId(plan.id);

			// Start location suggestion task
			const locationResponse = await fetch("/location-suggester", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					planId: plan.id,
					preferences: JSON.stringify(userPreferences),
					preferenceSummary: "",
				}),
			});

			if (!locationResponse.ok)
				throw new Error("Failed to start location suggester");

			const locationResult = await locationResponse.json();
			setLocationTaskId(locationResult.responseId);
			setIsPollingLocations(true);
			setTaskStatus("processing");
		} catch (error) {
			console.error("Failed to generate:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleRegenerate = async () => {
		if (!planId || isPollingLocations) return;

		// Clear existing locations
		setLocations([]);

		// Start new location suggestion task
		setIsGenerating(true);

		try {
			const response = await fetch("/location-suggester", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					planId,
					preferences: JSON.stringify(userPreferences),
					preferenceSummary: "",
				}),
			});

			if (!response.ok) throw new Error("Failed to regenerate");

			const result = await response.json();
			setLocationTaskId(result.responseId);
			setIsPollingLocations(true);
			setTaskStatus("processing");
		} catch (error) {
			console.error("Failed to regenerate:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleLocationSelect = async (location: Location) => {
		if (!planId) return;

		try {
			// Select the location
			await fetch(`/api/plans/${planId}/select/location`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ locationId: location.id }),
			});

			// Start research task
			const response = await fetch(`/location-researcher`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					planId,
					locationId: location.id,
					destination: { name: location.name, country: location.country },
					preferences: JSON.stringify(userPreferences),
					preferenceSummary: "",
				}),
			});

			if (response.ok) {
				const result = await response.json();
				setResearchTaskId(result.responseId);
				setIsPollingResearch(true);

				// Update location selection in UI
				setLocations((prev) =>
					prev.map((loc) => ({
						...loc,
						isSelected: loc.id === location.id,
					})),
				);
			}
		} catch (error) {
			console.error("Failed to select location:", error);
		}
	};

	const handleApplyFilters = (filters: FilterState) => {
		setAppliedFilters(filters);
	};

	const handleResetFilters = () => {
		setAppliedFilters(DEFAULT_FILTERS);
	};

	// Show initial state - no suggestions yet
	if (!planId || (locations.length === 0 && !isPollingLocations)) {
		return (
			<div className="flex-1 px-8 md:px-16 lg:px-24 xl:px-32 overflow-y-auto py-8">
				<div className="max-w-[1400px] mx-auto">
					<Filters
						filters={appliedFilters}
						onApply={handleApplyFilters}
						onReset={handleResetFilters}
					/>

					<div className="flex flex-col items-center justify-center py-16">
						<div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
							<Compass className="w-8 h-8 text-muted-foreground" />
						</div>
						<h2 className="text-xl font-semibold text-foreground mb-2">
							Ready to explore?
						</h2>
						<p className="text-muted-foreground text-center max-w-xs mb-6">
							Generate personalized travel suggestions based on your preferences.
						</p>
						<button
							onClick={handleGenerate}
							disabled={isGenerating}
							className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
						>
							<Sparkles
								className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`}
							/>
							<span>{isGenerating ? "Generating..." : "Generate Suggestions"}</span>
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 px-8 md:px-16 lg:px-24 xl:px-32 overflow-y-auto py-8">
			<div className="max-w-[1400px] mx-auto">
				<Filters
					filters={appliedFilters}
					onApply={handleApplyFilters}
					onReset={handleResetFilters}
				/>

				<div className="mb-8 flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold text-foreground">
							Your travel ideas
						</h1>
						{isPollingLocations && (
							<p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
								<Loader2 className="w-4 h-4 animate-spin" />
								AI is generating suggestions... ({taskStatus})
							</p>
						)}
						{!isPollingLocations && locations.length > 0 && (
							<p className="text-sm text-muted-foreground mt-1">
								{locations.length} trips based on your preferences
							</p>
						)}
					</div>
					<button
						onClick={handleRegenerate}
						disabled={isPollingLocations}
						className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-gradient-to-br from-purple-50/50 to-blue-50/50 hover:from-purple-100/50 hover:to-blue-100/50 text-foreground font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Sparkles
							className={`w-4 h-4 ${isPollingLocations ? "animate-spin" : ""}`}
						/>
						<span>{isPollingLocations ? "Generating..." : "Regenerate"}</span>
					</button>
				</div>

				{/* Loading skeleton */}
				{isPollingLocations && locations.length === 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{[...Array(8)].map((_, i) => (
							<div key={i} className="animate-pulse">
								<div className="bg-muted rounded-md aspect-[4/3] mb-4" />
								<div className="h-4 bg-muted rounded w-3/4 mb-2" />
								<div className="h-3 bg-muted rounded w-1/2" />
							</div>
						))}
					</div>
				)}

				{/* Location cards */}
				{locations.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{locations.map((location) => (
							<LocationCard
								key={location.id}
								location={location}
								onClick={() => handleLocationSelect(location)}
								isSelected={location.isSelected}
								isResearching={isPollingResearch && location.isSelected}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

