/**
 * Onboarding flow: steps for travel style, budget, trip length, companion, departure, then suggestions.
 * Shows intro, preference screens, suggestions feed, trip detail, and saved trip review.
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { IntroScreen } from "./screens/intro-screen"
import { TravelStyleScreen } from "./screens/travel-style-screen"
import { BudgetScreen } from "./screens/budget-screen"
import { TripLengthScreen } from "./screens/trip-length-screen"
import { CompanionScreen } from "./screens/companion-screen"
import { DepartureScreen } from "./screens/departure-screen"
import { AdditionalInfoScreen } from "./screens/additional-info-screen"
import { updateUserPreferences, generatePreferenceSummary, savePreferenceSummary } from "@/app/actions"

export interface OnboardingData {
  travelStyles: string[]
  budget: string
  tripLength: string
  companion: string
  departureLocation: string
  additionalNotes: string
}

interface OnboardingFlowProps {
  userId: string
}

const TOTAL_STEPS = 7

export function OnboardingFlow({ userId }: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [summaryTaskId, setSummaryTaskId] = useState<string | undefined>()
  const [isPolling, setIsPolling] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    travelStyles: [],
    budget: "",
    tripLength: "",
    companion: "",
    departureLocation: "",
    additionalNotes: "",
  })

  // Poll for summary completion
  useEffect(() => {
    if (!isPolling || !summaryTaskId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/check-status?responseId=${summaryTaskId}`)
        const statusData = await response.json()

        if (statusData.status === 'completed') {
          setIsPolling(false)
          // Save summary to database
          if (statusData.result) {
            await savePreferenceSummary(userId, statusData.result)
          }
        } else if (statusData.status === 'failed') {
          setIsPolling(false)
          console.error('Summary generation failed')
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [isPolling, summaryTaskId, userId])

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

  const handleComplete = async () => {
    setIsGeneratingSummary(true)
    
    try {
      // Save raw preferences
      const saveResult = await updateUserPreferences(userId, data)
      if (!saveResult.success) {
        console.error('Failed to save preferences:', saveResult.error)
        setIsGeneratingSummary(false)
        return
      }

      // Generate preference summary in background
      const summaryResult = await generatePreferenceSummary(userId, data)
      if (summaryResult.success && summaryResult.taskId) {
        setSummaryTaskId(summaryResult.taskId)
        setIsPolling(true)
      } else {
        console.error('Failed to generate summary:', summaryResult.error)
        // Continue anyway - summary is optional
      }

      // Redirect to explore page
      router.push('/dashboard/explore')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsGeneratingSummary(false)
    }
  }

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {step > 0 && (
        <div className="px-6 pt-6 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            disabled={isGeneratingSummary}
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
            onNext={handleNext}
          />
        )}
        {step === 6 && (
          <AdditionalInfoScreen
            value={data.additionalNotes}
            onChange={(notes) => updateData({ additionalNotes: notes })}
            onComplete={handleComplete}
            isLoading={isGeneratingSummary}
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
