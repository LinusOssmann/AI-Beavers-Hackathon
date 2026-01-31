"use client"

import Image from "next/image"

export interface Trip {
  id: string
  title: string
  destination: string
  heroImage: string
  dates: string
  budget: string
  travelStyle: string
}

interface TripCardProps {
  trip: Trip
  onClick: () => void
}

export function TripCard({ trip, onClick }: TripCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-border"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={trip.heroImage || "/placeholder.svg"}
          alt={trip.destination}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full">
            {trip.travelStyle}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-foreground leading-tight text-balance">
          {trip.title}
        </h3>
        <p className="text-base text-foreground">{trip.destination}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-muted-foreground">{trip.dates}</span>
          <span className="text-sm font-medium text-primary">{trip.budget}</span>
        </div>
      </div>
    </button>
  )
}
