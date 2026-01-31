"use client"

import Image from "next/image"
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  MapPin,
  Plane,
  Train,
  Star,
  Clock,
  Pencil,
} from "lucide-react"
import type { SavedTripData } from "./trip-detail"

interface SavedTripReviewProps {
  savedTrip: SavedTripData
  onBack: () => void
  onEdit: () => void
}

export function SavedTripReview({ savedTrip, onBack, onEdit }: SavedTripReviewProps) {
  const { trip, transport, accommodation, itinerary } = savedTrip

  const getTravelStyleEmoji = (style: string) => {
    const lowerStyle = style.toLowerCase()
    if (lowerStyle.includes("adventure")) return "mt"
    if (lowerStyle.includes("relax")) return "beach"
    if (lowerStyle.includes("cultural") || lowerStyle.includes("culture")) return "museum"
    if (lowerStyle.includes("food")) return "food"
    if (lowerStyle.includes("nature")) return "tree"
    if (lowerStyle.includes("urban")) return "city"
    return "plane"
  }

  const basePrice = parseInt(trip.budgetRange.replace(/[^0-9]/g, ""))
  
  const totalPrice = (transport?.price || 0) + (accommodation?.totalPrice || 0)

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "budget": return "Budget"
      case "comfort": return "Comfort"
      case "premium": return "Premium"
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "budget": return "bg-green-100 text-green-800"
      case "comfort": return "bg-blue-100 text-blue-800"
      case "premium": return "bg-amber-100 text-amber-800"
      default: return "bg-secondary text-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back button */}
      <div className="px-8 md:px-16 lg:px-24 xl:px-32 py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to My Trips</span>
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="px-8 md:px-16 lg:px-24 xl:px-32 pb-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
            <Image
              src={trip.heroImage || "/placeholder.svg"}
              alt={trip.destination}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block px-3 py-1.5 rounded-lg bg-white/90 text-foreground text-sm font-medium mb-3">
                {trip.travelStyle}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {trip.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-[1400px] mx-auto space-y-10">
          
          {/* Trip Overview */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{trip.destination}</span>
              </div>
              <span className="text-sm">-</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{trip.dates}</span>
              </div>
              <span className="text-sm">-</span>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-semibold text-foreground">
                  ${totalPrice.toLocaleString()} total
                </span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {trip.description}
            </p>
          </section>

          {/* Your Selections Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">Your selections</h2>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit trip</span>
            </button>
          </div>

          {/* Transportation */}
          {transport && (
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">Transportation</h3>
              <div className="p-5 rounded-xl border-2 border-border bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    {transport.type === "flight" ? (
                      <Plane className="w-5 h-5" />
                    ) : (
                      <Train className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">{transport.carrier}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {transport.from} to {transport.to}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground flex-wrap">
                      <span>{transport.departureDate}</span>
                      <span>-</span>
                      <span>{transport.departureTime} - {transport.arrivalTime}</span>
                      <span>-</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {transport.duration}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">${transport.price}</p>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Accommodation */}
          {accommodation && (
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">Accommodation</h3>
              <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0">
                    <Image
                      src={accommodation.image || "/placeholder.svg"}
                      alt={accommodation.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-lg ${getCategoryColor(accommodation.category)}`}>
                        {getCategoryLabel(accommodation.category)}
                      </span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">${accommodation.totalPrice}</p>
                        <p className="text-xs text-muted-foreground">total</p>
                      </div>
                    </div>

                    <h4 className="font-bold text-foreground text-xl mb-1">{accommodation.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{accommodation.location}</p>
                    
                    <div className="flex items-center gap-1.5 mb-4">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-foreground">{accommodation.rating}</span>
                      <span className="text-sm text-muted-foreground">({accommodation.reviewCount})</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      ${accommodation.pricePerNight} per night
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {accommodation.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="text-xs bg-secondary text-foreground px-3 py-1 rounded-lg border border-border"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Itinerary */}
          {itinerary.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Planned activities ({itinerary.length})
              </h3>
              <div className="space-y-3">
                {itinerary.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border-2 border-border bg-card"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-secondary text-foreground px-2 py-1 rounded border border-border font-medium">
                            {item.tag}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{item.duration}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-foreground mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No selections message */}
          {!transport && !accommodation && itinerary.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No selections made for this trip yet.</p>
              <button
                onClick={onEdit}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Add selections
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
        <div className="px-8 md:px-16 lg:px-24 xl:px-32 py-4">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total estimated cost</p>
              <p className="text-2xl font-bold text-foreground">${totalPrice.toLocaleString()}</p>
            </div>
            <button
              onClick={onEdit}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md"
            >
              Edit trip
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
