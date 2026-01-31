"use client"

import { useState } from "react"
import { MapPin, Calendar, DollarSign, Compass, X, SlidersHorizontal } from "lucide-react"

export interface FilterState {
  destination: string
  startDate: string
  endDate: string
  budgetMin: number
  budgetMax: number
  travelStyles: string[]
}

interface FiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onReset: () => void
}

const TRAVEL_STYLE_OPTIONS = [
  "Relax & slow",
  "Nature & outdoors",
  "Culture & cities",
  "Adventure & active",
  "Food & local life",
]

export function Filters({ filters, onChange, onReset }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = 
    filters.destination || 
    filters.startDate || 
    filters.endDate || 
    filters.budgetMin > 0 || 
    filters.budgetMax < 10000 ||
    filters.travelStyles.length > 0

  const toggleStyle = (style: string) => {
    const current = filters.travelStyles
    if (current.includes(style)) {
      onChange({ ...filters, travelStyles: current.filter((s) => s !== style) })
    } else {
      onChange({ ...filters, travelStyles: [...current, style] })
    }
  }

  return (
    <div className="bg-card border-b border-border sticky top-0 z-20">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
              isExpanded || hasActiveFilters
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-foreground hover:border-muted-foreground"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {[
                  filters.destination,
                  filters.startDate || filters.endDate,
                  filters.budgetMin > 0 || filters.budgetMax < 10000,
                  filters.travelStyles.length > 0,
                ].filter(Boolean).length}
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* Destination */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={filters.destination}
                onChange={(e) => onChange({ ...filters, destination: e.target.value })}
                placeholder="Where to?"
                className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-10 pr-4 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors text-sm"
              />
              {filters.destination && (
                <button
                  onClick={() => onChange({ ...filters, destination: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Travel Dates */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Travel dates</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                  className="w-full bg-secondary text-foreground pl-10 pr-3 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                  className="w-full bg-secondary text-foreground pl-10 pr-3 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Budget range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  value={filters.budgetMin || ""}
                  onChange={(e) => onChange({ ...filters, budgetMin: Number(e.target.value) || 0 })}
                  placeholder="Min"
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-10 pr-3 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  value={filters.budgetMax < 10000 ? filters.budgetMax : ""}
                  onChange={(e) => onChange({ ...filters, budgetMax: Number(e.target.value) || 10000 })}
                  placeholder="Max"
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-10 pr-3 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Travel Style */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Travel style</label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_STYLE_OPTIONS.map((style) => {
                const isSelected = filters.travelStyles.includes(style)
                return (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {style}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
