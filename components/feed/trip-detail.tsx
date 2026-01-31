"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { 
  ChevronLeft, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Plane, 
  Train, 
  Check,
  Star,
  Clock
} from "lucide-react"
import type { Trip } from "./trip-card"

interface TripDetailProps {
  trip: Trip
  onBack: () => void
  onSaveTrip?: (tripData: SavedTripData) => void
  onReviewTrip?: () => void
  existingSavedTrip?: SavedTripData | null
}

interface TransportOption {
  id: string
  type: "flight" | "train"
  from: string
  to: string
  departureDate: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  carrier: string
}

interface AccommodationOption {
  id: string
  name: string
  image: string
  category: "budget" | "comfort" | "premium"
  location: string
  rating: number
  reviewCount: number
  pricePerNight: number
  totalPrice: number
  amenities: string[]
}

interface ItineraryItem {
  id: string
  title: string
  description: string
  duration: string
  image: string
  tag: string
}

export interface SavedTripData {
  trip: Trip
  transport: TransportOption | null
  accommodation: AccommodationOption | null
  itinerary: ItineraryItem[]
}

export function TripDetail({ trip, onBack, onSaveTrip, onReviewTrip, existingSavedTrip }: TripDetailProps) {
  const [selectedTransport, setSelectedTransport] = useState<string | null>(
    existingSavedTrip?.transport?.id || null
  )
  const [selectedAccommodation, setSelectedAccommodation] = useState<string | null>(
    existingSavedTrip?.accommodation?.id || null
  )
  const [selectedItinerary, setSelectedItinerary] = useState<string[]>(
    existingSavedTrip?.itinerary?.map(i => i.id) || []
  )
  const [isSaved, setIsSaved] = useState(!!existingSavedTrip)
  const [justSaved, setJustSaved] = useState(false)

  // Gallery images
  const galleryImages = [
    trip.heroImage,
    "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80",
    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80",
    "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=800&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
  ]

  // Sample transport options
  const transportOptions: TransportOption[] = [
    {
      id: "t1",
      type: "flight",
      from: "New York (JFK)",
      to: trip.destination,
      departureDate: "Mar 15",
      departureTime: "08:30",
      arrivalTime: "14:45",
      duration: "6h 15m",
      price: 485,
      carrier: "United Airlines",
    },
    {
      id: "t2",
      type: "train",
      from: "New York (Penn)",
      to: trip.destination,
      departureDate: "Mar 15",
      departureTime: "07:00",
      arrivalTime: "19:30",
      duration: "12h 30m",
      price: 189,
      carrier: "Amtrak",
    },
  ]

  // Sample accommodations
  const accommodationOptions: AccommodationOption[] = [
    {
      id: "a1",
      name: "Cozy Garden Hostel",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      category: "budget",
      location: "City Center",
      rating: 4.2,
      reviewCount: 328,
      pricePerNight: 45,
      totalPrice: 315,
      amenities: ["WiFi", "Breakfast", "Shared kitchen"],
    },
    {
      id: "a2",
      name: "Harbor View Hotel",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      category: "comfort",
      location: "Waterfront District",
      rating: 4.6,
      reviewCount: 892,
      pricePerNight: 145,
      totalPrice: 1015,
      amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
    },
    {
      id: "a3",
      name: "The Grand Palace",
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      category: "premium",
      location: "Historic Quarter",
      rating: 4.9,
      reviewCount: 1247,
      pricePerNight: 320,
      totalPrice: 2240,
      amenities: ["WiFi", "Spa", "Pool", "Fine Dining", "Concierge"],
    },
  ]

  // Sample itinerary items
  const itineraryItems: ItineraryItem[] = [
    {
      id: "i1",
      title: "Local Food Market Tour",
      description: "Taste authentic local flavors and discover hidden culinary gems with a food expert",
      duration: "3-4 hours",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
      tag: "Food",
    },
    {
      id: "i2",
      title: "Old Town Walking Tour",
      description: "Explore cobblestone streets and historic architecture with a local storyteller",
      duration: "2-3 hours",
      image: "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=400&q=80",
      tag: "Culture",
    },
    {
      id: "i3",
      title: "Coastal Day Trip",
      description: "Visit stunning beaches and hidden coves along the dramatic coastline",
      duration: "Full day",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
      tag: "Adventure",
    },
  ]

  const toggleItineraryItem = (id: string) => {
    setSelectedItinerary(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const estimatedPrice = useMemo(() => {
    let total = 0
    if (selectedTransport) {
      const transport = transportOptions.find(t => t.id === selectedTransport)
      if (transport) total += transport.price
    }
    if (selectedAccommodation) {
      const accommodation = accommodationOptions.find(a => a.id === selectedAccommodation)
      if (accommodation) total += accommodation.totalPrice
    }
    return total
  }, [selectedTransport, selectedAccommodation])

  const canSave = selectedTransport !== null || selectedAccommodation !== null

  const handleSave = () => {
    if (!canSave) return
    const savedData: SavedTripData = {
      trip,
      transport: transportOptions.find(t => t.id === selectedTransport) || null,
      accommodation: accommodationOptions.find(a => a.id === selectedAccommodation) || null,
      itinerary: itineraryItems.filter(i => selectedItinerary.includes(i.id)),
    }
    setIsSaved(true)
    setJustSaved(true)
    onSaveTrip?.(savedData)
    setTimeout(() => setJustSaved(false), 3000)
  }

  const handleReviewOrSave = () => {
    if (isSaved && !justSaved) onReviewTrip?.()
    else handleSave()
  }

  const getCategoryLabel = (category: AccommodationOption["category"]) => {
    switch (category) {
      case "budget": return "Budget"
      case "comfort": return "Comfort"
      case "premium": return "Premium"
    }
  }

  const getCategoryColor = (category: AccommodationOption["category"]) => {
    switch (category) {
      case "budget": return "bg-green-100 text-green-800"
      case "comfort": return "bg-blue-100 text-blue-800"
      case "premium": return "bg-amber-100 text-amber-800"
    }
  }

  const getTravelStyleEmoji = (style: string) => {
    const lowerStyle = style.toLowerCase()
    if (lowerStyle.includes("adventure")) return "🏔️"
    if (lowerStyle.includes("relax")) return "🏖️"
    if (lowerStyle.includes("cultural") || lowerStyle.includes("culture")) return "🏛️"
    if (lowerStyle.includes("food")) return "🍽️"
    if (lowerStyle.includes("nature")) return "🌲"
    if (lowerStyle.includes("urban")) return "🏙️"
    return "✈️"
  }

  const basePrice = parseInt(trip.budgetRange.replace(/[^0-9]/g, ""))

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back button */}
      <div className="px-8 md:px-16 lg:px-24 xl:px-32 py-6 md:py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium">
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Two-column layout */}
      <div className="px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-12">
          {/* Left - Sticky gallery */}
          <div className="md:w-1/2 md:sticky md:top-24 space-y-2">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="relative w-full h-64 md:h-[300px] rounded-xl overflow-hidden">
                <Image src={img} alt={`${trip.destination} ${idx}`} fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* Right - Trip details */}
          <div className="md:w-1/2 space-y-12">
            {/* Trip header */}
            <section className="space-y-4">
              <span className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm
