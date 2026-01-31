"use client";

import { useState, useMemo } from "react";
import { Filters, type FilterState } from "./filters";
import { TripCard, type Trip } from "./trip-card";
import { SearchX } from "lucide-react";
import type { OnboardingData } from "@/components/onboarding/onboarding-flow";

interface SuggestionsFeedProps {
	onboardingData: OnboardingData;
	onTripClick: (trip: Trip) => void;
}

// Sample trip data based on onboarding preferences
const SAMPLE_TRIPS: Trip[] = [
	{
		id: "1",
		title: "Coastal serenity in the Algarve",
		destination: "Portugal",
		heroImage:
			"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
		dates: "Mar 15-22, 2026",
		budget: "$1,200",
		travelStyle: "Relax & slow",
	},
	{
		id: "2",
		title: "Hiking the Swiss Alps",
		destination: "Switzerland",
		heroImage:
			"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
		dates: "Apr 5-12, 2026",
		budget: "$2,400",
		travelStyle: "Nature & outdoors",
	},
	{
		id: "3",
		title: "Art and history in Florence",
		destination: "Italy",
		heroImage:
			"https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?w=800&q=80",
		dates: "May 1-7, 2026",
		budget: "$1,800",
		travelStyle: "Culture & cities",
	},
	{
		id: "4",
		title: "Surfing in Bali",
		destination: "Indonesia",
		heroImage:
			"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
		dates: "Jun 10-20, 2026",
		budget: "$1,500",
		travelStyle: "Adventure & active",
	},
	{
		id: "5",
		title: "Street food tour in Bangkok",
		destination: "Thailand",
		heroImage:
			"https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
		dates: "Jul 5-12, 2026",
		budget: "$900",
		travelStyle: "Food & local life",
	},
	{
		id: "6",
		title: "Northern Lights in Iceland",
		destination: "Iceland",
		heroImage:
			"https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80",
		dates: "Feb 20-27, 2026",
		budget: "$2,800",
		travelStyle: "Nature & outdoors",
	},
	{
		id: "7",
		title: "Wine country escape",
		destination: "France",
		heroImage:
			"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
		dates: "Sep 10-17, 2026",
		budget: "$2,100",
		travelStyle: "Relax & slow",
	},
	{
		id: "8",
		title: "Tokyo adventure",
		destination: "Japan",
		heroImage:
			"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
		dates: "Oct 1-10, 2026",
		budget: "$3,200",
		travelStyle: "Culture & cities",
	},
];

const DEFAULT_FILTERS: FilterState = {
	destination: "",
	startDate: "",
	endDate: "",
	budgetMin: 0,
	budgetMax: 10000,
	travelStyles: [],
};

export function SuggestionsFeed({
	onboardingData,
	onTripClick,
}: SuggestionsFeedProps) {
	const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

	const filteredTrips = useMemo(() => {
		return SAMPLE_TRIPS.filter((trip) => {
			// Filter by destination
			if (
				filters.destination &&
				!trip.destination
					.toLowerCase()
					.includes(filters.destination.toLowerCase())
			) {
				return false;
			}

			// Filter by budget
			const tripBudget = parseInt(trip.budget.replace(/[^0-9]/g, ""));
			if (
				tripBudget < filters.budgetMin ||
				tripBudget > filters.budgetMax
			) {
				return false;
			}

			// Filter by travel style
			if (
				filters.travelStyles.length > 0 &&
				!filters.travelStyles.includes(trip.travelStyle)
			) {
				return false;
			}

			return true;
		});
	}, [filters]);

	const handleResetFilters = () => {
		setFilters(DEFAULT_FILTERS);
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Filters
				filters={filters}
				onChange={setFilters}
				onReset={handleResetFilters}
			/>

			<div className="flex-1 px-4 py-6">
				<div className="max-w-2xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<h1 className="text-2xl font-semibold text-foreground">
							Your travel ideas
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Based on your preferences
							{filters.destination ||
							filters.travelStyles.length > 0
								? " and filters"
								: ""}
						</p>
					</div>

					{/* Trip Grid */}
					{filteredTrips.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2">
							{filteredTrips.map((trip) => (
								<TripCard
									key={trip.id}
									trip={trip}
									onClick={() => onTripClick(trip)}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-16">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
								<SearchX className="w-8 h-8 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No trips found
							</h3>
							<p className="text-muted-foreground mb-4">
								Try adjusting your filters to see more results.
							</p>
							<button
								onClick={handleResetFilters}
								className="text-primary font-medium hover:underline"
							>
								Clear all filters
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
