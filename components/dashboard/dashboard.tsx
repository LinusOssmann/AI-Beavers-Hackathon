"use client";

import { useState } from "react";
import { SuggestionsFeed } from "@/components/feed/suggestions-feed";
import { TripDetail, type SavedTripData } from "@/components/feed/trip-detail";
import type { Trip } from "@/components/feed/trip-card";
import type { OnboardingData } from "@/components/onboarding/onboarding-flow";

interface User {
	id: string;
	name: string;
	email: string;
	preferences?: {
		travelStyles?: string[];
		budget?: string;
		tripLength?: string;
		companion?: string;
		departureLocation?: string;
	};
	plans: Array<{
		id: string;
		title: string;
		description?: string;
		startDate?: Date;
		endDate?: Date;
		createdAt: Date;
		updatedAt: Date;
	}>;
}

interface DashboardProps {
	user: User;
}

export function Dashboard({ user }: DashboardProps) {
	const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
	const [selectedSavedTrip, setSelectedSavedTrip] = useState<SavedTripData | null>(null);
	const [savedTrips, setSavedTrips] = useState<SavedTripData[]>([]);

	// Transform user preferences to onboarding data format
	const onboardingData: OnboardingData = {
		travelStyles: user.preferences?.travelStyles || [],
		budget: user.preferences?.budget || "",
		tripLength: user.preferences?.tripLength || "",
		companion: user.preferences?.companion || "",
		departureLocation: user.preferences?.departureLocation || "",
	};

	const handleTripClick = (trip: Trip) => {
		setSelectedTrip(trip);
		setSelectedSavedTrip(null);
	};

	const handleSavedTripClick = (savedTrip: SavedTripData) => {
		setSelectedSavedTrip(savedTrip);
		setSelectedTrip(null);
	};

	const handleBackToFeed = () => {
		setSelectedTrip(null);
		setSelectedSavedTrip(null);
	};

	const handleSaveTrip = (savedTrip: SavedTripData) => {
		setSavedTrips((prev) => [...prev, savedTrip]);
	};

	// If a trip is selected, show the detail view
	if (selectedTrip) {
		return (
			<TripDetail
				trip={selectedTrip}
				onBack={handleBackToFeed}
				onSaveTrip={handleSaveTrip}
			/>
		);
	}

	// If a saved trip is selected, show it in detail view
	if (selectedSavedTrip) {
		return (
			<TripDetail
				trip={selectedSavedTrip.trip}
				onBack={handleBackToFeed}
				onSaveTrip={handleSaveTrip}
				existingSavedTrip={selectedSavedTrip}
			/>
		);
	}

	// Otherwise show the suggestions feed
	return (
		<SuggestionsFeed
			onboardingData={onboardingData}
			onTripClick={handleTripClick}
			savedTrips={savedTrips}
			onSavedTripClick={handleSavedTripClick}
		/>
	);
}
