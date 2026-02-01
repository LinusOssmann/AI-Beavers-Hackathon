"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  MapPin,
  Calendar,
  DollarSign,
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
  Users,
} from "lucide-react"

export interface FilterState {
  destination: string
  startDate: string
  endDate: string
  flexibleDates: boolean
  budgetMin: number
  budgetMax: number
  travelStyles: string[]
  numberOfTravelers: number
  startingPoint: string
  travelingWithPet: boolean
  tripDurationMin: number
  tripDurationMax: number
}

interface FiltersProps {
  filters: FilterState
  onApply: (filters: FilterState) => void
  onReset: () => void
}

const TRAVEL_STYLE_OPTIONS = [
  { id: "adventure", label: "Adventure & Active", emoji: "🏔️" },
  { id: "relax", label: "Relax & Slow Travel", emoji: "🌴" },
  { id: "nature", label: "Nature & Outdoors", emoji: "🌲" },
  { id: "culture", label: "Culture & Cities", emoji: "🏛️" },
  { id: "food", label: "Food & Local Life", emoji: "🍜" },
  { id: "beach", label: "Beach & Coastal", emoji: "🏖️" },
  { id: "mountains", label: "Mountains & Hiking", emoji: "⛰️" },
  { id: "roadtrip", label: "Road Trips", emoji: "🚗" },
  { id: "backpacking", label: "Backpacking", emoji: "🎒" },
  { id: "luxury", label: "Luxury & Wellness", emoji: "💆" },
  { id: "photography", label: "Photography & Scenic", emoji: "📸" },
  { id: "wildlife", label: "Wildlife & Safari", emoji: "🦁" },
  { id: "festivals", label: "Festivals & Events", emoji: "🎉" },
  { id: "spiritual", label: "Spiritual & Retreat", emoji: "🧘" },
  { id: "solo", label: "Solo Travel Friendly", emoji: "🚶" },
  { id: "romantic", label: "Romantic Getaway", emoji: "💑" },
  { id: "family", label: "Family Trip", emoji: "👨‍👩‍👧‍👦" },
]

const LOCATION_SUGGESTIONS = [
  "Portugal",
  "Switzerland",
  "Italy",
  "Indonesia",
  "Thailand",
  "Iceland",
  "France",
  "Japan",
  "Spain",
  "Greece",
  "Morocco",
  "New Zealand",
]

const STARTING_POINT_SUGGESTIONS = [
  "New York, USA",
  "Los Angeles, USA",
  "London, UK",
  "Paris, France",
  "Berlin, Germany",
  "Amsterdam, Netherlands",
  "Sydney, Australia",
  "Tokyo, Japan",
]

export function Filters({ filters, onApply, onReset }: FiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)
  const [showMoreFiltersModal, setShowMoreFiltersModal] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showStartingPointDropdown, setShowStartingPointDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>(LOCATION_SUGGESTIONS)
  const [startingPointSuggestions, setStartingPointSuggestions] = useState<string[]>(STARTING_POINT_SUGGESTIONS)
  const [debouncedDestination, setDebouncedDestination] = useState(localFilters.destination)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Debounce destination input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDestination(localFilters.destination)
    }, 300)
    return () => clearTimeout(timer)
  }, [localFilters.destination])

  // Filter location suggestions
  useEffect(() => {
    if (debouncedDestination) {
      const filtered = LOCATION_SUGGESTIONS.filter((loc) =>
        loc.toLowerCase().includes(debouncedDestination.toLowerCase())
      )
      setLocationSuggestions(filtered)
    } else {
      setLocationSuggestions(LOCATION_SUGGESTIONS)
    }
  }, [debouncedDestination])

  // Filter starting point suggestions
  useEffect(() => {
    if (localFilters.startingPoint) {
      const filtered = STARTING_POINT_SUGGESTIONS.filter((loc) =>
        loc.toLowerCase().includes(localFilters.startingPoint.toLowerCase())
      )
      setStartingPointSuggestions(filtered)
    } else {
      setStartingPointSuggestions(STARTING_POINT_SUGGESTIONS)
    }
  }, [localFilters.startingPoint])

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showMoreFiltersModal) setShowMoreFiltersModal(false)
        if (showDatePicker) setShowDatePicker(false)
        if (showLocationDropdown) setShowLocationDropdown(false)
        if (showStartingPointDropdown) setShowStartingPointDropdown(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [showMoreFiltersModal, showDatePicker, showLocationDropdown, showStartingPointDropdown])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showMoreFiltersModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showMoreFiltersModal])

  // Get active filter chips
  const getActiveChips = useCallback(() => {
    const chips: { key: string; label: string }[] = []
    if (filters.destination) chips.push({ key: "destination", label: filters.destination })
    if (filters.startDate && filters.endDate) {
      chips.push({ key: "dates", label: `${filters.startDate} - ${filters.endDate}` })
    } else if (filters.startDate) {
      chips.push({ key: "startDate", label: `From ${filters.startDate}` })
    }
    if (filters.flexibleDates) chips.push({ key: "flexibleDates", label: "Flexible dates" })
    if (filters.budgetMin > 0 || filters.budgetMax < 10000) {
      chips.push({ key: "budget", label: `$${filters.budgetMin} - $${filters.budgetMax}` })
    }
    if (filters.numberOfTravelers > 1) chips.push({ key: "travelers", label: `${filters.numberOfTravelers} travelers` })
    if (filters.startingPoint) chips.push({ key: "startingPoint", label: `From ${filters.startingPoint}` })
    if (filters.tripDurationMin > 1 || filters.tripDurationMax < 30) {
      chips.push({ key: "duration", label: `${filters.tripDurationMin}-${filters.tripDurationMax} days` })
    }
    if (filters.travelingWithPet) chips.push({ key: "pet", label: "🐕 Pet-friendly" })
    filters.travelStyles.forEach((styleId) => {
      const style = TRAVEL_STYLE_OPTIONS.find((s) => s.id === styleId)
      if (style) chips.push({ key: `style-${styleId}`, label: `${style.emoji} ${style.label}` })
    })
    return chips
  }, [filters])

  const activeChips = getActiveChips()
  const moreFiltersCount =
    localFilters.travelStyles.length +
    (localFilters.startingPoint ? 1 : 0) +
    (localFilters.budgetMin > 0 || localFilters.budgetMax < 10000 ? 1 : 0) +
    (localFilters.tripDurationMin > 1 || localFilters.tripDurationMax < 30 ? 1 : 0) +
    (localFilters.travelingWithPet ? 1 : 0)

  const toggleStyle = (styleId: string) => {
    const current = localFilters.travelStyles
    if (current.includes(styleId)) {
      setLocalFilters({ ...localFilters, travelStyles: current.filter((s) => s !== styleId) })
    } else {
      setLocalFilters({ ...localFilters, travelStyles: [...current, styleId] })
    }
  }

  const handleApply = async () => {
    setIsApplying(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    onApply(localFilters)
    setShowMoreFiltersModal(false)
    setShowDatePicker(false)
    setIsApplying(false)
  }

  const handleReset = () => {
    const resetFilters: FilterState = {
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
    setLocalFilters(resetFilters)
    onReset()
  }

  const removeChip = (key: string) => {
    const newFilters = { ...filters }
    if (key === "destination") newFilters.destination = ""
    else if (key === "startDate" || key === "dates") {
      newFilters.startDate = ""
      newFilters.endDate = ""
    } else if (key === "flexibleDates") newFilters.flexibleDates = false
    else if (key === "budget") {
      newFilters.budgetMin = 0
      newFilters.budgetMax = 10000
    } else if (key === "travelers") newFilters.numberOfTravelers = 1
    else if (key === "startingPoint") newFilters.startingPoint = ""
    else if (key === "duration") {
      newFilters.tripDurationMin = 1
      newFilters.tripDurationMax = 30
    } else if (key === "pet") newFilters.travelingWithPet = false
    else if (key.startsWith("style-")) {
      const styleId = key.replace("style-", "")
      newFilters.travelStyles = newFilters.travelStyles.filter((s) => s !== styleId)
    }
    onApply(newFilters)
    setLocalFilters(newFilters)
  }

  const selectLocation = (location: string) => {
    setLocalFilters({ ...localFilters, destination: location })
    setShowLocationDropdown(false)
  }

  const selectStartingPoint = (location: string) => {
    setLocalFilters({ ...localFilters, startingPoint: location })
    setShowStartingPointDropdown(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply()
    }
  }

  const getDateDisplayText = () => {
    if (localFilters.flexibleDates) return "Flexible"
    if (localFilters.startDate && localFilters.endDate) {
      return `${localFilters.startDate} - ${localFilters.endDate}`
    }
    if (localFilters.startDate) return `From ${localFilters.startDate}`
    return "Any dates"
  }

  return (
    <div className="bg-background border-border sticky top-0 z-20 border-b-0">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 py-4">
        {/* Main Filters - Single Row */}
        <div className="flex items-center gap-3">
          {/* Location */}
          <div className="flex-1 relative">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={localFilters.destination}
                onChange={(e) => setLocalFilters({ ...localFilters, destination: e.target.value })}
                onFocus={() => setShowLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 150)}
                onKeyDown={handleKeyDown}
                placeholder="Where"
                className="w-full bg-card text-foreground placeholder:text-muted-foreground pl-9 pr-9 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors text-sm"
              />
              {localFilters.destination && (
                <button
                  onClick={() => setLocalFilters({ ...localFilters, destination: "" })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear destination"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showLocationDropdown && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                {locationSuggestions.map((loc) => (
                  <button
                    key={loc}
                    onMouseDown={() => selectLocation(loc)}
                    className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors text-sm text-foreground"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex-1 relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full px-3 pl-9 py-2.5 rounded-lg border text-left text-sm transition-colors relative bg-card border-border text-foreground hover:bg-secondary"
            >
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <span className="block truncate">{getDateDisplayText()}</span>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </button>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border z-30 p-4 min-w-[280px] rounded-xs shadow-none">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Date</label>
                    <input
                      type="date"
                      value={localFilters.startDate}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, startDate: e.target.value, flexibleDates: false })
                      }
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Date</label>
                    <input
                      type="date"
                      value={localFilters.endDate}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, endDate: e.target.value, flexibleDates: false })
                      }
                      min={localFilters.startDate}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setLocalFilters({ ...localFilters, flexibleDates: true, startDate: "", endDate: "" })
                      setShowDatePicker(false)
                    }}
                    className="w-full text-center px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
                  >
                    Flexible dates
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Travelers */}
          <div className="flex-none w-36">
            <div className="flex items-center px-3 py-2.5 bg-card rounded-lg border border-border gap-2">
              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-center justify-between flex-1 gap-1.5">
                <button
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      numberOfTravelers: Math.max(1, localFilters.numberOfTravelers - 1),
                    })
                  }
                  disabled={localFilters.numberOfTravelers <= 1}
                  className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all text-foreground"
                >
                  <span className="text-sm">−</span>
                </button>
                <span className="text-sm font-medium text-foreground min-w-[20px] text-center">
                  {localFilters.numberOfTravelers}
                </span>
                <button
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      numberOfTravelers: Math.min(10, localFilters.numberOfTravelers + 1),
                    })
                  }
                  disabled={localFilters.numberOfTravelers >= 10}
                  className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all text-foreground"
                >
                  <span className="text-sm">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-none px-6 py-2.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 font-medium text-sm"
          >
            <Search className="w-4 h-4" />
            Search
          </button>

          {/* More Filters Button */}
          <button
            onClick={() => setShowMoreFiltersModal(true)}
            className={`flex-none w-10 h-10 rounded-lg border flex items-center justify-center transition-colors relative ${
              moreFiltersCount > 0
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border text-foreground hover:bg-secondary"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {moreFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {moreFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-border">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-foreground text-xs font-medium rounded-full border border-border"
              >
                {chip.label}
                <button
                  onClick={() => removeChip(chip.key)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* More Filters Modal */}
      {showMoreFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMoreFiltersModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-card rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">More Filters</h2>
              <button
                onClick={() => setShowMoreFiltersModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Starting Point */}
                <div className="relative">
                  <h3 className="text-sm font-bold text-foreground mb-3">Starting From</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={localFilters.startingPoint}
                      onChange={(e) => setLocalFilters({ ...localFilters, startingPoint: e.target.value })}
                      onFocus={() => setShowStartingPointDropdown(true)}
                      onBlur={() => setTimeout(() => setShowStartingPointDropdown(false), 150)}
                      placeholder="Search starting location..."
                      className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-9 pr-9 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                    />
                    {localFilters.startingPoint && (
                      <button
                        onClick={() => setLocalFilters({ ...localFilters, startingPoint: "" })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {showStartingPointDropdown && startingPointSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                      {startingPointSuggestions.map((loc) => (
                        <button
                          key={loc}
                          onMouseDown={() => selectStartingPoint(loc)}
                          className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors text-sm text-foreground"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trip Duration */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Trip Duration (days)</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={localFilters.tripDurationMin}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            tripDurationMin: Math.max(1, Math.min(Number(e.target.value), localFilters.tripDurationMax)),
                          })
                        }
                        className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:border-primary focus:outline-none transition-colors"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-muted-foreground text-sm">to</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={localFilters.tripDurationMax}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            tripDurationMax: Math.max(localFilters.tripDurationMin, Math.min(Number(e.target.value), 365)),
                          })
                        }
                        className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:border-primary focus:outline-none transition-colors"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Budget Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Min: </span>
                        <span className="font-bold text-foreground">${localFilters.budgetMin.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Max: </span>
                        <span className="font-bold text-foreground">
                          {localFilters.budgetMax >= 10000 ? "$10,000+" : `$${localFilters.budgetMax.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2">
                      <div className="absolute inset-0 bg-secondary rounded-full" />
                      <div
                        className="absolute h-full bg-primary rounded-full"
                        style={{
                          left: `${(localFilters.budgetMin / 10000) * 100}%`,
                          right: `${100 - (localFilters.budgetMax / 10000) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={localFilters.budgetMin}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            budgetMin: Math.min(Number(e.target.value), localFilters.budgetMax - 100),
                          })
                        }
                        className="absolute w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={localFilters.budgetMax}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            budgetMax: Math.max(Number(e.target.value), localFilters.budgetMin + 100),
                          })
                        }
                        className="absolute w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Travel Style */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Travel Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLE_OPTIONS.map((style) => {
                      const isSelected = localFilters.travelStyles.includes(style.id)
                      return (
                        <button
                          key={style.id}
                          onClick={() => toggleStyle(style.id)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-card text-foreground hover:bg-secondary"
                          }`}
                        >
                          <span className="mr-1.5">{style.emoji}</span>
                          {style.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Pet Friendly */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Additional Options</h3>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={localFilters.travelingWithPet}
                      onChange={(e) => setLocalFilters({ ...localFilters, travelingWithPet: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-xl">🐕</span>
                    <span className="text-sm font-medium text-foreground">Traveling with a pet</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-70"
              >
                {isApplying ? "Applying..." : "Show results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
