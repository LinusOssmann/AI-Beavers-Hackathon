"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { IntroScreen } from "./screens/intro-screen";
import { TravelStyleScreen } from "./screens/travel-style-screen";
import { BudgetScreen } from "./screens/budget-screen";
import { TripLengthScreen } from "./screens/trip-length-screen";
import { CompanionScreen } from "./screens/companion-screen";
import { DepartureScreen } from "./screens/departure-screen";
import { SuggestionsFeed } from "../feed/suggestions-feed";
import { TripDetail } from "../feed/trip-detail";
import type { Trip } from "../feed/trip-card";

export interface OnboardingData {
	travelStyles: string[];
	budget: string;
	tripLength: string;
	companion: string;
	departureLocation: string;
}

const TOTAL_STEPS = 6;

interface OnboardingFlowProps {
	userId?: string;
}

export function OnboardingFlow({ userId }: OnboardingFlowProps = {}) {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
	const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [data, setData] = useState<OnboardingData>({
		travelStyles: [],
		budget: "",
		tripLength: "",
		companion: "",
		departureLocation: "",
	});

	const handleNext = () => {
		if (step < TOTAL_STEPS - 1) {
			setStep(step + 1);
		}
	};

	const handleBack = () => {
		if (step > 0) {
			setStep(step - 1);
		}
	};

	const handleSkip = () => {
		handleNext();
	};

	const handleComplete = async () => {
		// If userId is provided, save preferences to database
		if (userId) {
			setIsSaving(true);
			try {
				const response = await fetch(`/api/users/${userId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						preferences: {
							travelStyles: data.travelStyles,
							budget: data.budget,
							tripLength: data.tripLength,
							companion: data.companion,
							departureLocation: data.departureLocation,
						},
						onboardingComplete: true,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error("Failed to save preferences");
				}

				toast.success("Preferences saved!");
				router.push("/dashboard");
				router.refresh();
			} catch (error) {
				console.error("Error saving preferences:", error);
				toast.error("Failed to save preferences");
				setIsSaving(false);
			}
		} else {
			// Fallback to showing feed if no userId (for standalone usage)
			setIsOnboardingComplete(true);
		}
	};

	const updateData = (updates: Partial<OnboardingData>) => {
		setData((prev) => ({ ...prev, ...updates }));
	};

	const handleTripClick = (trip: Trip) => {
		setSelectedTrip(trip);
	};

	const handleBackToFeed = () => {
		setSelectedTrip(null);
	};

	// Show trip detail if selected
	if (selectedTrip) {
		return <TripDetail trip={selectedTrip} onBack={handleBackToFeed} />;
	}

	// Show suggestions feed after onboarding (only if no userId provided)
	if (isOnboardingComplete && !userId) {
		return (
			<SuggestionsFeed
				onboardingData={data}
				onTripClick={handleTripClick}
			/>
		);
	}

	return (
		<main className="min-h-screen bg-background flex flex-col">
			{step > 0 && (
				<div className="px-6 pt-6 flex items-center gap-4">
					<button
						onClick={handleBack}
						className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
						disabled={isSaving}
					>
						<ChevronLeft className="w-4 h-4" />
						<span>Back</span>
					</button>
					<div className="flex-1">
						<ProgressIndicator
							currentStep={step}
							totalSteps={TOTAL_STEPS - 1}
						/>
					</div>
				</div>
			)}

			<div className="flex-1 flex flex-col">
				{step === 0 && <IntroScreen onStart={handleNext} />}
				{step === 1 && (
					<TravelStyleScreen
						selected={data.travelStyles}
						onSelect={(styles) =>
							updateData({ travelStyles: styles })
						}
						onNext={handleNext}
						onSkip={handleSkip}
					/>
				)}
				{step === 2 && (
					<BudgetScreen
						selected={data.budget}
						onSelect={(budget) => updateData({ budget })}
						onNext={handleNext}
						onSkip={handleSkip}
					/>
				)}
				{step === 3 && (
					<TripLengthScreen
						selected={data.tripLength}
						onSelect={(length) =>
							updateData({ tripLength: length })
						}
						onNext={handleNext}
						onSkip={handleSkip}
					/>
				)}
				{step === 4 && (
					<CompanionScreen
						selected={data.companion}
						onSelect={(companion) => updateData({ companion })}
						onNext={handleNext}
						onSkip={handleSkip}
					/>
				)}
				{step === 5 && (
					<DepartureScreen
						value={data.departureLocation}
						onChange={(location) =>
							updateData({ departureLocation: location })
						}
						onComplete={handleComplete}
						isLoading={isSaving}
					/>
				)}
			</div>
		</main>
	);
}

function ProgressIndicator({
	currentStep,
	totalSteps,
}: {
	currentStep: number;
	totalSteps: number;
}) {
	return (
		<div className="flex gap-1.5">
			{Array.from({ length: totalSteps }, (_, i) => (
				<div
					key={i}
					className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
						i < currentStep ? "bg-primary" : "bg-secondary"
					}`}
				/>
			))}
		</div>
	);
}
