/**
 * Suggestions feed: creates a plan, runs location suggester, polls for locations and research.
 * Lets the user select a location and start research, then navigate to trip detail.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Compass } from "lucide-react";
import { Filters, type FilterState } from "./filters";
import { LocationCard } from "./location-card";
import type { Location } from "@/generated/prisma/client";
import { generatePreferenceSummary, savePreferenceSummary } from "@/app/actions";

interface SuggestionsFeedProps {
	userId: string;
	userPreferences: any;
	preferenceSummary: string | null;
	needsSummaryRegeneration?: boolean;
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
	preferenceSummary,
	needsSummaryRegeneration = false,
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
	const locationsSignatureRef = useRef("");
	const unchangedLocationPollsRef = useRef(0);
	const researchSignatureRef = useRef("");
	const unchangedResearchPollsRef = useRef(0);
	const researchRequestsRef = useRef<Set<string>>(new Set());
	const [appliedFilters, setAppliedFilters] =
		useState<FilterState>(DEFAULT_FILTERS);
	const [summary, setSummary] = useState(preferenceSummary);
	const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);

	// Regenerate summary if missing
	useEffect(() => {
		if (needsSummaryRegeneration && !summary && !isRegeneratingSummary) {
			handleRegenerateSummary();
		}
	}, [needsSummaryRegeneration, summary]);

	const handleRegenerateSummary = async () => {
		if (!userPreferences) return;
		
		setIsRegeneratingSummary(true);
		const result = await generatePreferenceSummary(userId, userPreferences);
		
		if (result.success && result.taskId) {
			pollForSummary(result.taskId);
		} else {
			setIsRegeneratingSummary(false);
		}
	};

	const pollForSummary = async (taskId: string) => {
		const maxAttempts = 40; // 2 minutes max
		let attempts = 0;

		const poll = async () => {
			if (attempts >= maxAttempts) {
				setIsRegeneratingSummary(false);
				return;
			}

			try {
				const response = await fetch(`/check-status?responseId=${taskId}`);
				const data = await response.json();

				if (data.status === "completed") {
					setIsRegeneratingSummary(false);
					if (data.result) {
						await savePreferenceSummary(userId, data.result);
						setSummary(data.result);
					}
					return;
				} else if (data.status === "failed") {
					setIsRegeneratingSummary(false);
					console.error("Summary generation failed");
					return;
				}

				// Continue polling
				attempts++;
				setTimeout(poll, 6000);
			} catch (error) {
				console.error("Polling error:", error);
				setIsRegeneratingSummary(false);
			}
		};

		poll();
	};

	// Poll for location suggestions
	useEffect(() => {
		if (!isPollingLocations || !locationTaskId || !planId) return;
		let isActive = true;

		const pollPlan = async () => {
			try {
				const planResponse = await fetch(`/api/plans/${planId}`);
				if (!planResponse.ok) return;
				const plan = await planResponse.json();
				if (!isActive) return;

				const nextLocations = plan.locations || [];
				setLocations(nextLocations);
				setTaskStatus(`${nextLocations.length} found`);

				const signature = nextLocations.map((location: Location) => location.id).join(",");
				if (signature === locationsSignatureRef.current) {
					unchangedLocationPollsRef.current += 1;
				} else {
					locationsSignatureRef.current = signature;
					unchangedLocationPollsRef.current = 0;
				}

				if (nextLocations.length > 0 && unchangedLocationPollsRef.current >= 3) {
					setIsPollingLocations(false);
				}
			} catch (error) {
				console.error("Polling error:", error);
			}
		};

		pollPlan();
		const pollInterval = setInterval(pollPlan, 8000);

		return () => {
			isActive = false;
			clearInterval(pollInterval);
		};
	}, [isPollingLocations, locationTaskId, planId]);

	// Poll for research results
	useEffect(() => {
		if (!isPollingResearch || !researchTaskId || !planId) return;
		let isActive = true;

		const pollPlan = async () => {
			try {
				const planResponse = await fetch(`/api/plans/${planId}`);
				if (!planResponse.ok) return;
				const plan = await planResponse.json();
				if (!isActive) return;

				const locationsWithResearch =
					(plan.locations || []) as Array<
						Location & {
							accommodations?: unknown[];
							activities?: unknown[];
							transports?: unknown[];
						}
					>;
				const researchCount = locationsWithResearch.reduce((total, loc) => {
					return (
						total +
						(loc.accommodations?.length || 0) +
						(loc.activities?.length || 0) +
						(loc.transports?.length || 0)
					);
				}, 0);
				const signature = `${researchCount}:${plan.updatedAt ?? ""}`;

				if (signature === researchSignatureRef.current) {
					unchangedResearchPollsRef.current += 1;
				} else {
					researchSignatureRef.current = signature;
					unchangedResearchPollsRef.current = 0;
					router.refresh();
				}

				if (researchCount > 0 && unchangedResearchPollsRef.current >= 3) {
					setIsPollingResearch(false);
				}
			} catch (error) {
				console.error("Polling error:", error);
			}
		};

		pollPlan();
		const pollInterval = setInterval(pollPlan, 8000);

		return () => {
			isActive = false;
			clearInterval(pollInterval);
		};
	}, [isPollingResearch, planId, researchTaskId, router]);

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
				}),
			});

			if (!locationResponse.ok)
				throw new Error("Failed to start location suggester");

			const locationResult = await locationResponse.json();
			setLocationTaskId(locationResult.responseId);
			locationsSignatureRef.current = "";
			unchangedLocationPollsRef.current = 0;
			setIsPollingLocations(true);
			setTaskStatus("polling");
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
				}),
			});

			if (!response.ok) throw new Error("Failed to regenerate");

			const result = await response.json();
			setLocationTaskId(result.responseId);
			locationsSignatureRef.current = "";
			unchangedLocationPollsRef.current = 0;
			setIsPollingLocations(true);
			setTaskStatus("polling");
		} catch (error) {
			console.error("Failed to regenerate:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleLocationSelect = async (location: Location) => {
		if (!planId) return;
		if (!location?.id) {
			console.error("Missing location id for destination navigation", location);
			return;
		}
		const isResearchRunningForLocation =
			researchRequestsRef.current.has(location.id) ||
			(isPollingResearch && location.isSelected);

		if (isResearchRunningForLocation || location.isSelected) {
			router.push(`/dashboard/explore/destination/${location.id}`);
			return;
		}

		try {
			researchRequestsRef.current.add(location.id);
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
				}),
			});

			if (!response.ok) {
				researchRequestsRef.current.delete(location.id);
				throw new Error("Failed to start research");
			}

			const result = await response.json();
			setResearchTaskId(result.responseId);
			researchSignatureRef.current = "";
			unchangedResearchPollsRef.current = 0;
			setIsPollingResearch(true);

			// Update location selection in UI
			setLocations((prev) =>
				prev.map((loc) => ({
					...loc,
					isSelected: loc.id === location.id,
				})),
			);
		} catch (error) {
			researchRequestsRef.current.delete(location.id);
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

