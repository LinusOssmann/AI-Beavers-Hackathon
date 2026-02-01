"use client"

import { useMemo } from "react"
import { useState } from "react"
import { Filters, type FilterState } from "./filters"
import { TripCard, type Trip } from "./trip-card"
import { TopNav } from "../navigation/top-nav"
import { Compass, Sparkles } from "lucide-react"
import type { OnboardingData } from "../onboarding/onboarding-flow"
import type { SavedTripData } from "./trip-detail"

interface SuggestionsFeedProps {
  onboardingData: OnboardingData
  onTripClick: (trip: Trip) => void
  savedTrips: SavedTripData[]
  onSavedTripClick: (savedTrip: SavedTripData) => void
}

// Sample trip data with emotional imagery and descriptions
const SAMPLE_TRIPS: Trip[] = [
  {
    id: "2",
    title: "Alpine adventure in Switzerland",
    destination: "Switzerland",
    heroImage: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&q=80",
    dates: "Apr 5-12",
    budgetRange: "$2,200 - $2,800",
    travelStyle: "Nature & outdoors",
    travelStyleIcon: "nature",
    description: "Hike breathtaking trails, breathe fresh mountain air, and discover charming alpine villages.",
  },
  {
    id: "3",
    title: "Art and history in Florence",
    destination: "Italy",
    heroImage: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
    dates: "May 1-7",
    budgetRange: "$1,600 - $2,000",
    travelStyle: "Culture & cities",
    travelStyleIcon: "culture",
    description: "Wander through Renaissance masterpieces, savor authentic cuisine, and soak in Italian charm.",
  },
  {
    id: "4",
    title: "Surfing paradise in Bali",
    destination: "Indonesia",
    heroImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    dates: "Jun 10-20",
    budgetRange: "$1,300 - $1,700",
    travelStyle: "Adventure & active",
    travelStyleIcon: "adventure",
    description: "Catch perfect waves, explore rice terraces, and experience the magic of island life.",
  },
  {
    id: "5",
    title: "Street food journey in Bangkok",
    destination: "Thailand",
    heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    dates: "Jul 5-12",
    budgetRange: "$800 - $1,100",
    travelStyle: "Food & local life",
    travelStyleIcon: "food",
    description: "Discover vibrant markets, taste incredible flavors, and connect with local culture.",
  },
  {
    id: "6",
    title: "Northern Lights expedition",
    destination: "Iceland",
    heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
    dates: "Feb 20-27",
    budgetRange: "$2,500 - $3,200",
    travelStyle: "Nature & outdoors",
    travelStyleIcon: "nature",
    description: "Chase the aurora borealis, soak in hot springs, and explore dramatic volcanic landscapes.",
  },
  {
    id: "7",
    title: "Wine country retreat",
    destination: "France",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    dates: "Sep 10-17",
    budgetRange: "$1,900 - $2,400",
    travelStyle: "Relax & slow",
    travelStyleIcon: "relax",
    description: "Tour world-renowned vineyards, enjoy gourmet dining, and relax in the French countryside.",
  },
  {
    id: "8",
    title: "Tokyo urban exploration",
    destination: "Japan",
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    dates: "Oct 1-10",
    budgetRange: "$2,800 - $3,500",
    travelStyle: "Culture & cities",
    travelStyleIcon: "culture",
    description: "Experience ancient temples, futuristic tech, and the world's best culinary scene.",
  },
  {
    id: "1",
    title: "Coastal serenity in the Algarve",
    destination: "Portugal",
    heroImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    dates: "Mar 15-22",
    budgetRange: "$1,100 - $1,400",
    travelStyle: "Relax & slow",
    travelStyleIcon: "relax",
    description: "Unwind on golden beaches, explore hidden coves, and watch stunning sunsets over the Atlantic.",
  },
]

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
}

export function SuggestionsFeed({ onboardingData, onTripClick, savedTrips, onSavedTripClick }: SuggestionsFeedProps) {
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [activeTab, setActiveTab] = useState<"explore" | "trips" | "profile">("explore")
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleApplyFilters = (filters: FilterState) => {
    setAppliedFilters(filters)
  }

  const handleResetFilters = () => {
    setAppliedFilters(DEFAULT_FILTERS)
  }

  const handleRegenerate = () => {
    setIsRegenerating(true)
    // Simulate AI regeneration
    setTimeout(() => {
      setIsRegenerating(false)
    }, 2000)
  }

  const filteredTrips = useMemo(() => {
    return SAMPLE_TRIPS.filter((trip) => {
      if (appliedFilters.destination && trip.destination !== appliedFilters.destination) {
        return false
      }
      if (appliedFilters.startDate && trip.dates < appliedFilters.startDate) {
        return false
      }
      if (appliedFilters.endDate && trip.dates > appliedFilters.endDate) {
        return false
      }
      if (appliedFilters.travelStyles.length > 0 && !appliedFilters.travelStyles.includes(trip.travelStyle)) {
        return false
      }
      if (trip.budgetRange.replace(/[$,]/g, '') < appliedFilters.budgetMin || trip.budgetRange.replace(/[$,]/g, '') > appliedFilters.budgetMax) {
        return false
      }
      return true
    })
  }, [appliedFilters])

  // My Itineraries tab with saved/generated trips
  if (activeTab === "trips") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 px-8 md:px-16 lg:px-24 xl:px-32 overflow-y-auto py-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground">My Itineraries</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {savedTrips.length} {savedTrips.length === 1 ? "itinerary" : "itineraries"} generated
              </p>
            </div>

            {savedTrips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedTrips.map((savedTrip) => (
                  <TripCard
                    key={savedTrip.trip.id}
                    trip={savedTrip.trip}
                    onClick={() => onSavedTripClick(savedTrip)}
                    isSaved
                    isGenerated={!!savedTrip.generatedItinerary}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Compass className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No itineraries yet</h2>
                <p className="text-muted-foreground text-center max-w-xs">
                  Explore trips and generate your personalized itinerary to see them here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (activeTab === "profile") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <span className="text-2xl font-semibold text-muted-foreground">JD</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1">John Doe</h2>
          <p className="text-muted-foreground mb-6">john.doe@email.com</p>
          <button className="text-primary font-medium hover:underline">Edit preferences</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Filters filters={appliedFilters} onApply={handleApplyFilters} onReset={handleResetFilters} />

      <div className="flex-1 px-8 md:px-16 lg:px-24 xl:px-32 overflow-y-auto py-1 pb-10 pt-9">
        <div className="max-w-[1400px] mx-auto">
          {/* Header with Regenerate Button */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Your travel ideas</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {SAMPLE_TRIPS.length} trips based on your preferences
              </p>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-gradient-to-br from-purple-50/50 to-blue-50/50 hover:from-purple-100/50 hover:to-blue-100/50 text-foreground font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
            </button>
          </div>

          {/* Trip Grid - 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SAMPLE_TRIPS.map((trip) => (
              <TripCard key={trip.id} trip={trip} onClick={() => onTripClick(trip)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
