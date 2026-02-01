"use client"

import React from "react"
import Image from "next/image"
import { Heart, Palmtree, Mountain, Building2, Waves, UtensilsCrossed, MapPin, Calendar } from "lucide-react"
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
  isGenerated?: boolean
}

const STYLE_ICONS = {
  relax: Palmtree,
  nature: Mountain,
  culture: Building2,
  adventure: Waves,
  food: UtensilsCrossed,
}

export function TripCard({ trip, onClick, isSaved = false, isGenerated = false }: TripCardProps) {
  const [isLiked, setIsLiked] = useState(isSaved)
  const StyleIcon = STYLE_ICONS[trip.travelStyleIcon] || Palmtree

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  return (
    <button
      onClick={onClick}
      className="w-full h-full text-left bg-card overflow-hidden border border-border hover:border-muted-foreground shadow-sm hover:shadow-md transition-all duration-200 group rounded-md flex flex-col"
    >
      {/* Hero Image - Full bleed, no padding */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
        <Image
          src={trip.heroImage || "/placeholder.svg"}
          alt={trip.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Like button */}
        
        
        {/* Travel style badge - bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="bg-background/95 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1.5 rounded inline-flex items-center gap-1.5 border border-border">
            <StyleIcon className="w-3.5 h-3.5" />
            {trip.travelStyle}
          </span>
          {isGenerated && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded">
              AI
            </span>
          )}
        </div>
      </div>

      {/* Content - With padding, aligned to top */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-foreground text-lg leading-snug line-clamp-2">
          {trip.title}
        </h3>

        {/* Destination, Dates & Price - All in one row */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{trip.destination}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{trip.dates}</span>
          </div>
          <span>•</span>
          <span>{trip.budgetRange}</span>
        </div>

        {/* Description - 3-4 lines */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {trip.description}
        </p>
      </div>
    </button>
  )
}
