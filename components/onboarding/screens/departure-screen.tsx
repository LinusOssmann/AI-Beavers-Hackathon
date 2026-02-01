"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, Loader2 } from "lucide-react"
import type { City } from "@/types/city"

interface DepartureScreenProps {
  value: string
  onChange: (location: string) => void
  onComplete: () => void
}

export function DepartureScreen({ value, onChange, onComplete }: DepartureScreenProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Debounce and fetch cities from API
    const timer = setTimeout(async () => {
      if (value && isFocused && value.length >= 2) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/cities/search?q=${encodeURIComponent(value)}&limit=5`)
          if (response.ok) {
            const data = await response.json()
            const cityNames = data.cities.map((city: City) => `${city.name}, ${city.country}`)
            setSuggestions(cityNames)
          } else {
            setSuggestions([])
          }
        } catch (error) {
          console.error("Error fetching cities:", error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [value, isFocused])

  const handleSelect = (city: string) => {
    onChange(city)
    setSuggestions([])
    inputRef.current?.blur()
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg w-full mx-auto">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Where do you usually start your trips from?
        </h2>
        <p className="text-sm text-muted-foreground">
          We'll use this to estimate flight times and prices.
        </p>
      </div>

      <div className="flex-1">
        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Enter your city"
              className="w-full bg-card text-foreground placeholder:text-muted-foreground pl-12 pr-4 py-4 rounded-lg border-2 border-border focus:border-primary focus:outline-none transition-colors text-base"
            />
          </div>
          
          {(suggestions.length > 0 || isLoading) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-lg overflow-hidden z-10 shadow-md">
              {isLoading ? (
                <div className="flex items-center justify-center px-4 py-3 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Searching cities...</span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSelect(city)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors text-foreground"
                  >
                    {city}
                  </button>
                ))
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onComplete}
          disabled={!value.trim()}
          className="w-full bg-primary text-primary-foreground py-4 px-6 text-base font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          See my travel ideas
        </button>
      </div>
    </div>
  )
}
