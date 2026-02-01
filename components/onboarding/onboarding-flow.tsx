/**
 * Onboarding flow: steps for travel style, budget, trip length, companion, departure, then suggestions.
 * Shows intro, preference screens, suggestions feed, trip detail, and saved trip review.
 */
"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { IntroScreen } from "./screens/intro-screen"
import { TravelStyleScreen } from "./screens/travel-style-screen"
import { BudgetScreen } from "./screens/budget-screen"
import { TripLengthScreen } from "./screens/trip-length-screen"
import { CompanionScreen } from "./screens/companion-screen"
import { DepartureScreen } from "./screens/departure-screen"
import { SuggestionsFeed } from "../feed/suggestions-feed"
import { TripDetail, type SavedTripData } from "../feed/trip-detail"
import { SavedTripReview } from "../feed/saved-trip-review"
import type { Trip } from "../feed/trip-card"

export interface OnboardingData {
  travelStyles: string[]
  budget: string
  tripLength: string
  companion: string
  departureLocation: string
}

const TOTAL_STEPS = 6

export function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [savedTrips, setSavedTrips] = useState<SavedTripData[]>([])
  const [viewingSavedTrip, setViewingSavedTrip] = useState<SavedTripData | null>(null)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [data, setData] = useState<OnboardingData>({
    travelStyles: [],
    budget: "",
    tripLength: "",
    companion: "",
    departureLocation: "",
  })

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleComplete = () => {
    setIsOnboardingComplete(true)
  }

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip)
    setEditingTrip(null)
  }

  const handleBackToFeed = () => {
    setSelectedTrip(null)
    setEditingTrip(null)
    setViewingSavedTrip(null)
  }

  const handleSaveTrip = (tripData: SavedTripData) => {
    setSavedTrips(prev => {
      const existingIndex = prev.findIndex(t => t.trip.id === tripData.trip.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = tripData
        return updated
      }
      return [...prev, tripData]
    })
  }

  const handleSavedTripClick = (savedTrip: SavedTripData) => {
    setViewingSavedTrip(savedTrip)
  }

  const handleReviewTrip = () => {
    if (selectedTrip) {
      const savedTrip = savedTrips.find(t => t.trip.id === selectedTrip.id)
      if (savedTrip) {
        setViewingSavedTrip(savedTrip)
        setSelectedTrip(null)
      }
    }
  }

  const handleEditTrip = () => {
    if (viewingSavedTrip) {
      setEditingTrip(viewingSavedTrip.trip)
      setSelectedTrip(viewingSavedTrip.trip)
      setViewingSavedTrip(null)
    }
  }

  const getExistingSavedTrip = (tripId: string) => {
    return savedTrips.find(t => t.trip.id === tripId) || null
  }

  // Show saved trip review
  if (viewingSavedTrip) {
    return (
      <SavedTripReview
        savedTrip={viewingSavedTrip}
        onBack={handleBackToFeed}
        onEdit={handleEditTrip}
      />
    )
  }

  // Show trip detail if selected
  if (selectedTrip) {
    return (
      <TripDetail
        trip={selectedTrip}
        onBack={handleBackToFeed}
        onSaveTrip={handleSaveTrip}
        onReviewTrip={handleReviewTrip}
        existingSavedTrip={getExistingSavedTrip(selectedTrip.id)}
      />
    )
  }

  // Show suggestions feed after onboarding
  if (isOnboardingComplete) {
    return (
      <SuggestionsFeed
        onboardingData={data}
        onTripClick={handleTripClick}
        savedTrips={savedTrips}
        onSavedTripClick={handleSavedTripClick}
      />
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {step > 0 && (
        <div className="px-6 pt-6 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex-1">
            <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS - 1} />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        {step === 0 && <IntroScreen onStart={handleNext} />}
        {step === 1 && (
          <TravelStyleScreen
            selected={data.travelStyles}
            onSelect={(styles) => updateData({ travelStyles: styles })}
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
            onSelect={(length) => updateData({ tripLength: length })}
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
            onChange={(location) => updateData({ departureLocation: location })}
            onComplete={handleComplete}
          />
        )}
      </div>
    </main>
  )
}

function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
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
  )
}
