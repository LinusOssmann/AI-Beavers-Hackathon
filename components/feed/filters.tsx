"use client"

import { useState, useEffect, useCallback } from "react"

import {
  MapPin,
  Calendar,
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
  { id: "adventure", label: "Adventure & Active" },
  { id: "relax", label: "Relax & Slow Travel" },
  { id: "nature", label: "Nature & Outdoors" },
  { id: "culture", label: "Culture & Cities" },
  { id: "food", label: "Food & Local Life" },
  { id: "beach", label: "Beach & Coastal" },
  { id: "mountains", label: "Mountains & Hiking" },
  { id: "roadtrip", label: "Road Trips" },
  { id: "luxury", label: "Luxury & Wellness" },
  { id: "photography", label: "Photography & Scenic" },
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
]

const STARTING_POINT_SUGGESTIONS = [
  "New York, USA",
  "Los Angeles, USA",
  "London, UK",
  "Paris, France",
  "Berlin, Germany",
  "Amsterdam, Netherlands",
]

export function Filters({ filters, onApply, onReset }: FiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)
  const [showMoreFiltersModal, setShowMoreFiltersModal] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showStartingPointDropdown, setShowStartingPointDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>(LOCATION_SUGGESTIONS)
  const [startingPointSuggestions, setStartingPointSuggestions] = useState<string[]>(STARTING_POINT_SUGGESTIONS)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    if (localFilters.destination) {
      const filtered = LOCATION_SUGGESTIONS.filter((loc) =>
        loc.toLowerCase().includes(localFilters.destination.toLowerCase())
      )
      setLocationSuggestions(filtered)
    } else {
      setLocationSuggestions(LOCATION_SUGGESTIONS)
    }
  }, [localFilters.destination])

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMoreFiltersModal(false)
        setShowDatePicker(false)
        setShowLocationDropdown(false)
        setShowStartingPointDropdown(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

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

  const getActiveChips = useCallback(() => {
    const chips: { key: string; label: string }[] = []
    if (filters.destination) chips.push({ key: "destination", label: filters.destination })
    if (filters.startDate && filters.endDate) {
      chips.push({ key: "dates", label: `${filters.startDate} - ${filters.endDate}` })
    }
    if (filters.flexibleDates) chips.push({ key: "flexibleDates", label: "Flexible dates" })
    if (filters.budgetMin > 0 || filters.budgetMax < 10000) {
      chips.push({ key: "budget", label: `$${filters.budgetMin} - $${filters.budgetMax}` })
    }
    if (filters.numberOfTravelers > 1) chips.push({ key: "travelers", label: `${filters.numberOfTravelers} travelers` })
    if (filters.startingPoint) chips.push({ key: "startingPoint", label: `From ${filters.startingPoint}` })
    if (filters.travelingWithPet) chips.push({ key: "pet", label: "Pet-friendly" })
    filters.travelStyles.forEach((styleId) => {
      const style = TRAVEL_STYLE_OPTIONS.find((s) => s.id === styleId)
      if (style) chips.push({ key: `style-${styleId}`, label: style.label })
    })
    return chips
  }, [filters])

  const activeChips = getActiveChips()
  const moreFiltersCount =
    localFilters.travelStyles.length +
    (localFilters.startingPoint ? 1 : 0) +
    (localFilters.budgetMin > 0 || localFilters.budgetMax < 10000 ? 1 : 0) +
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
    await new Promise((resolve) => setTimeout(resolve, 200))
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
    else if (key === "dates") {
      newFilters.startDate = ""
      newFilters.endDate = ""
    } else if (key === "flexibleDates") newFilters.flexibleDates = false
    else if (key === "budget") {
      newFilters.budgetMin = 0
      newFilters.budgetMax = 10000
    } else if (key === "travelers") newFilters.numberOfTravelers = 1
    else if (key === "startingPoint") newFilters.startingPoint = ""
    else if (key === "pet") newFilters.travelingWithPet = false
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

  const getDateDisplayText = () => {
    if (localFilters.flexibleDates) return "Flexible dates"
    if (localFilters.startDate && localFilters.endDate) {
      return `${localFilters.startDate} - ${localFilters.endDate}`
    }
    if (localFilters.startDate) return `From ${localFilters.startDate}`
    return "Any dates"
  }

  return (
    <div className="bg-card border-border sticky top-14 z-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-6">
        <div className="hidden md:flex items-end gap-3">
          <div className="flex-[3.5] relative">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Where</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={localFilters.destination}
                onChange={(e) => setLocalFilters({ ...localFilters, destination: e.target.value })}
                onFocus={() => setShowLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 150)}
                placeholder="Any destination"
                className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-10 pr-8 py-2.5 h-11 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors text-sm"
              />
              {localFilters.destination && (
                <button
                  onClick={() => setLocalFilters({ ...localFilters, destination: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear destination"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showLocationDropdown && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                {locationSuggestions.map((loc) => (
                  <button
                    key={loc}
                    onMouseDown={() => selectLocation(loc)}
                    className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors text-sm text-foreground"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-[2.5] relative">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">When</label>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`w-full h-11 px-3 pl-10 pr-9 rounded-xl border text-left text-sm transition-colors relative ${
                localFilters.flexibleDates || localFilters.startDate
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "bg-secondary border-border text-foreground hover:bg-secondary/80"
              }`}
            >
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              <span className="block truncate">{getDateDisplayText()}</span>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </button>

            {showDatePicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-30 p-4 min-w-[280px]">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                    <input
                      type="date"
                      value={localFilters.startDate}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, startDate: e.target.value, flexibleDates: false })
                      }
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">End Date</label>
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
                    {"I'm flexible"}
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Set dates
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-[1.8] relative">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Travelers</label>
            <div className="flex items-center h-11 px-3 bg-secondary rounded-xl border border-border gap-2">
              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-center justify-between flex-1 gap-1">
                <button
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      numberOfTravelers: Math.max(1, localFilters.numberOfTravelers - 1),
                    })
                  }
                  disabled={localFilters.numberOfTravelers <= 1}
                  className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Decrease travelers"
                >
                  <span className="text-base leading-none">-</span>
                </button>
                <span className="text-sm font-semibold text-foreground min-w-[20px] text-center">
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
                  className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Increase travelers"
                >
                  <span className="text-base leading-none">+</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="h-11 px-5 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 shadow-sm"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Search</span>
            </button>
          </div>

          <div>
            <button
              onClick={() => setShowMoreFiltersModal(true)}
              className={`h-11 px-4 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                moreFiltersCount > 0
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-secondary border-border text-foreground hover:bg-secondary/80"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {moreFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {moreFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Where</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={localFilters.destination}
                  onChange={(e) => setLocalFilters({ ...localFilters, destination: e.target.value })}
                  onFocus={() => setShowLocationDropdown(true)}
                  onBlur={() => setTimeout(() => setShowLocationDropdown(false), 150)}
                  placeholder="Any destination"
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-10 pr-8 py-3 h-12 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                />
              </div>
              {showLocationDropdown && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                  {locationSuggestions.map((loc) => (
                    <button
                      key={loc}
                      onMouseDown={() => selectLocation(loc)}
                      className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors text-sm text-foreground"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-6">
              <button
                onClick={() => setShowMoreFiltersModal(true)}
                className={`h-12 w-12 rounded-xl border flex items-center justify-center relative transition-colors ${
                  moreFiltersCount > 0
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-secondary border-border text-foreground"
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {moreFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {moreFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-[2] relative">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">When</label>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`w-full h-12 px-3 pl-10 rounded-xl border text-left text-sm transition-colors relative ${
                  localFilters.flexibleDates || localFilters.startDate
                    ? "bg-primary/10 border-primary text-primary font-medium"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                <span className="block truncate">{getDateDisplayText()}</span>
              </button>
            </div>
            <div className="flex-[1.2] relative">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Travelers</label>
              <div className="flex items-center h-12 px-3 bg-secondary rounded-xl border border-border gap-1">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center justify-between flex-1 gap-1">
                  <button
                    onClick={() =>
                      setLocalFilters({
                        ...localFilters,
                        numberOfTravelers: Math.max(1, localFilters.numberOfTravelers - 1),
                      })
                    }
                    disabled={localFilters.numberOfTravelers <= 1}
                    className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="text-base leading-none">-</span>
                  </button>
                  <span className="text-sm font-semibold text-foreground min-w-[20px] text-center">
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
                    className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="text-base leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="h-12 w-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-70 shadow-sm"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-1">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground text-sm rounded-full"
              >
                {chip.label}
                <button
                  onClick={() => removeChip(chip.key)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {showMoreFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMoreFiltersModal(false)}
          />
          <div className="relative bg-card rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              <button
                onClick={() => setShowMoreFiltersModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div className="relative">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Starting From</h3>
                  <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={localFilters.startingPoint}
                      onChange={(e) => setLocalFilters({ ...localFilters, startingPoint: e.target.value })}
                      onFocus={() => setShowStartingPointDropdown(true)}
                      onBlur={() => setTimeout(() => setShowStartingPointDropdown(false), 150)}
                      placeholder="Search starting location..."
                      className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-11 pr-10 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                    />
                    {localFilters.startingPoint && (
                      <button
                        onClick={() => setLocalFilters({ ...localFilters, startingPoint: "" })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {showStartingPointDropdown && startingPointSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 max-w-md mt-1 bg-card border border-border rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                      {startingPointSuggestions.map((loc) => (
                        <button
                          key={loc}
                          onMouseDown={() => selectStartingPoint(loc)}
                          className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors text-sm text-foreground"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50" />

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Price Range</h3>
                  <div className="flex items-center gap-4 max-w-md">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Min ($)</label>
                      <input
                        type="number"
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
                        className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <span className="text-muted-foreground pt-5">to</span>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Max ($)</label>
                      <input
                        type="number"
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
                        className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50" />

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Travel Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLE_OPTIONS.map((style) => {
                      const isSelected = localFilters.travelStyles.includes(style.id)
                      return (
                        <button
                          key={style.id}
                          onClick={() => toggleStyle(style.id)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary/50"
                          }`}
                        >
                          {style.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-border/50" />

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Additional Options</h3>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary/50 cursor-pointer transition-all max-w-md">
                    <input
                      type="checkbox"
                      checked={localFilters.travelingWithPet}
                      onChange={(e) => setLocalFilters({ ...localFilters, travelingWithPet: e.target.checked })}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground">Traveling with a pet</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-border bg-card rounded-b-2xl">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-70"
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
