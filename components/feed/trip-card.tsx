"use client"

import React from "react"

import Image from "next/image"
import { Heart, Palmtree, Mountain, Building2, Waves, UtensilsCrossed } from "lucide-react"
import { useState } from "react"

export interface Trip {
  id: string
  title: string
  destination: string
  heroImage: string
  dates: string
  budgetRange: string
  travelStyle: string
  travelStyleIcon: "relax" | "nature" | "culture" | "adventure" | "food"
  description: string
  highlights?: string[]
}

interface TripCardProps {
  trip: Trip
  onClick: () => void
  isSaved?: boolean
}

const STYLE_ICONS = {
  relax: Palmtree,
  nature: Mountain,
  culture: Building2,
  adventure: Waves,
  food: UtensilsCrossed,
}

export function TripCard({ trip, onClick, isSaved = false }: TripCardProps) {
  const [isLiked, setIsLiked] = useState(isSaved)
  const StyleIcon = STYLE_ICONS[trip.travelStyleIcon] || Palmtree

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  return (
    <button
      onClick={onClick}
      className="w-full h-full text-left bg-card rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group p-3 flex flex-col"
    >
      {/* Hero Image - Large and prominent */}
      <div className="relative aspect-square overflow-hidden bg-muted rounded-2xl mb-4 flex-shrink-0">
        <Image
          src={trip.heroImage || "/placeholder.svg"}
          alt={trip.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Like button */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors ${
              isLiked ? "fill-red-500 text-red-500" : "text-foreground"
            }`}
          />
        </button>
        
        {/* Travel style badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-md">
            <StyleIcon className="w-3.5 h-3.5" />
            {trip.travelStyle}
          </span>
        </div>
      </div>

      {/* Card Content - Grows to fill remaining space */}
      <div className="px-1 space-y-3 flex-grow flex flex-col">
        {/* Title */}
        <h3 className="text-xl font-bold text-foreground leading-tight">
          {trip.title}
        </h3>

        {/* Destination, Dates & Price */}
        <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-1.5">
          <span>{trip.destination}</span>
          <span>•</span>
          <span>{trip.dates}</span>
          <span>•</span>
          <span>{trip.budgetRange}</span>
        </div>

        {/* Description - Grows to fill remaining space */}
        <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
          {trip.description}
        </p>
      </div>
    </button>
  )
}
