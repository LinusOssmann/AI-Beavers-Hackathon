"use client"

import Image from "next/image"
import { ChevronLeft, Calendar, DollarSign, MapPin, Compass } from "lucide-react"
import type { Trip } from "./trip-card"

interface TripDetailProps {
  trip: Trip
  onBack: () => void
}

export function TripDetail({ trip, onBack }: TripDetailProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96">
        <Image
          src={trip.heroImage || "/placeholder.svg"}
          alt={trip.destination}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-1 bg-card/90 backdrop-blur-sm text-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-card transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="absolute bottom-6 left-6 right-6">
          <span className="inline-block bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full mb-3">
            {trip.travelStyle}
          </span>
          <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight text-balance">
            {trip.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium text-foreground">{trip.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Dates</p>
                <p className="text-sm font-medium text-foreground">{trip.dates}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Estimated budget</p>
                <p className="text-sm font-medium text-foreground">{trip.budget}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <Compass className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Style</p>
                <p className="text-sm font-medium text-foreground">{trip.travelStyle}</p>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">About this trip</h2>
            <p className="text-muted-foreground leading-relaxed">
              This is a placeholder for the full trip details. In a future version, this section will include a detailed itinerary, accommodation options, flight information, and personalized recommendations based on your preferences.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <button className="w-full bg-primary text-primary-foreground py-4 px-6 text-base font-medium rounded-xl hover:opacity-90 transition-opacity">
              Save to wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
