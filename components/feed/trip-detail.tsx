"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	Calendar,
	DollarSign,
	MapPin,
	Plane,
	Train,
	Check,
	Star,
	Clock,
	Bed,
	Edit2,
	Sparkles,
} from "lucide-react";
import type { Trip } from "./trip-card";

interface TripDetailProps {
	trip: Trip;
	onBack: () => void;
	onSaveTrip?: (tripData: SavedTripData) => void;
	onReviewTrip?: () => void;
	existingSavedTrip?: SavedTripData | null;
}

interface TransportOption {
	id: string;
	type: "flight" | "train";
	from: string;
	to: string;
	departureDate: string;
	departureTime: string;
	arrivalTime: string;
	duration: string;
	price: number;
	carrier: string;
}

interface AccommodationOption {
	id: string;
	name: string;
	image: string;
	category: "budget" | "comfort" | "premium";
	location: string;
	rating: number;
	reviewCount: number;
	pricePerNight: number;
	totalPrice: number;
	amenities: string[];
}

interface ItineraryItem {
	id: string;
	title: string;
	description: string;
	duration: string;
	image: string;
	tag: string;
}

export interface DayActivity {
	id: string;
	time: string;
	title: string;
	description: string;
	location: string;
	duration: string;
	type: "activity" | "meal" | "transport" | "free";
}

export interface DayItineraryData {
	day: number;
	date: string;
	title: string;
	activities: DayActivity[];
}

export interface SavedTripData {
	trip: Trip;
	transport: TransportOption | null;
	accommodation: AccommodationOption | null;
	itinerary: ItineraryItem[];
	generatedItinerary: DayItineraryData[] | null;
	savedAt: string;
}

interface DayItinerary {
	day: number;
	date: string;
	title: string;
	activities: DayActivity[];
}

type AccordionSection = "transport" | "accommodation" | "activities" | null;

export function TripDetail({
	trip,
	onBack,
	onSaveTrip,
	onReviewTrip,
	existingSavedTrip,
}: TripDetailProps) {
	const [selectedTransport, setSelectedTransport] = useState<string | null>(
		existingSavedTrip?.transport?.id || null,
	);
	const [selectedAccommodation, setSelectedAccommodation] = useState<
		string | null
	>(existingSavedTrip?.accommodation?.id || null);
	const [selectedItinerary, setSelectedItinerary] = useState<string[]>(
		existingSavedTrip?.itinerary?.map((i) => i.id) || [],
	);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [openSection, setOpenSection] =
		useState<AccordionSection>("transport");
	const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
	const [generatedItinerary, setGeneratedItinerary] = useState<
		DayItineraryData[] | null
	>(null);
	const [viewMode, setViewMode] = useState<"selection" | "itinerary">(
		"selection",
	);
	const [expandedDays, setExpandedDays] = useState<number[]>([]);

	// Photo gallery
	const galleryImages = [
		trip.heroImage,
		"https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80",
		"https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80",
		"https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=800&q=80",
		"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
	];

	// Sample transportation options
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
	];

	// Sample accommodation options
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
	];

	// Simplified itinerary items with tags
	const itineraryItems: ItineraryItem[] = [
		{
			id: "i1",
			title: "Local Food Market Tour",
			description:
				"Taste authentic local flavors and discover hidden culinary gems with a food expert",
			duration: "3-4 hours",
			image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
			tag: "Food",
		},
		{
			id: "i2",
			title: "Old Town Walking Tour",
			description:
				"Explore cobblestone streets and historic architecture with a local storyteller",
			duration: "2-3 hours",
			image: "https://images.unsplash.com/photo-1524850011238-b723cf961d3e?w=400&q=80",
			tag: "Culture",
		},
		{
			id: "i3",
			title: "Coastal Day Trip",
			description:
				"Visit stunning beaches and hidden coves along the dramatic coastline",
			duration: "Full day",
			image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
			tag: "Adventure",
		},
		{
			id: "i4",
			title: "Cooking Class with Local Chef",
			description:
				"Learn to prepare traditional dishes in a hands-on workshop",
			duration: "3 hours",
			image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80",
			tag: "Food",
		},
		{
			id: "i5",
			title: "Museum & Art Gallery Visit",
			description:
				"Discover world-class collections and contemporary exhibitions",
			duration: "3-4 hours",
			image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=400&q=80",
			tag: "Culture",
		},
		{
			id: "i6",
			title: "Spa & Wellness Day",
			description:
				"Rejuvenate with traditional treatments and thermal baths",
			duration: "4-5 hours",
			image: "https://images.unsplash.com/photo-1540551763-92fee7e34c0b?w=400&q=80",
			tag: "Relaxation",
		},
		{
			id: "i7",
			title: "Sunset Cruise",
			description:
				"Sail along the coast with drinks and stunning sunset views",
			duration: "2-3 hours",
			image: "https://images.unsplash.com/photo-1544551763-92fee7e34c0b?w=400&q=80",
			tag: "Relaxation",
		},
		{
			id: "i8",
			title: "Hiking & Nature Walk",
			description: "Trek through scenic trails with breathtaking views",
			duration: "4-5 hours",
			image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80",
			tag: "Adventure",
		},
	];

	// Calculate estimated price
	const estimatedPrice = useMemo(() => {
		let total = 0;
		if (selectedTransport) {
			const transport = transportOptions.find(
				(t) => t.id === selectedTransport,
			);
			if (transport) total += transport.price;
		}
		if (selectedAccommodation) {
			const accommodation = accommodationOptions.find(
				(a) => a.id === selectedAccommodation,
			);
			if (accommodation) total += accommodation.totalPrice;
		}
		return total;
	}, [selectedTransport, selectedAccommodation]);

	const canGenerate =
		selectedTransport !== null || selectedAccommodation !== null;

	const generateItinerary = async () => {
		if (!canGenerate) return;

		setIsGeneratingItinerary(true);

		// Simulate AI generation with a delay
		await new Promise((resolve) => setTimeout(resolve, 2500));

		// Generate a sample itinerary
		const selectedActivities = itineraryItems.filter((i) =>
			selectedItinerary.includes(i.id),
		);

		const sampleItinerary: DayItineraryData[] = [
			{
				day: 1,
				date: "March 15",
				title: "Arrival & City Exploration",
				activities: [
					{
						id: "d1-a1",
						time: "09:00",
						title: selectedTransport
							? transportOptions.find(
									(t) => t.id === selectedTransport,
							  )?.carrier + " Arrival"
							: "Arrival",
						description: `Arrive at ${trip.destination} and transfer to your accommodation`,
						location: trip.destination,
						duration: "2 hours",
						type: "transport",
					},
					{
						id: "d1-a2",
						time: "12:00",
						title: "Check-in & Lunch",
						description: selectedAccommodation
							? `Check in at ${
									accommodationOptions.find(
										(a) => a.id === selectedAccommodation,
									)?.name
							  } and enjoy a welcome lunch`
							: "Check in at your accommodation and enjoy a local lunch",
						location: "City Center",
						duration: "2 hours",
						type: "meal",
					},
					{
						id: "d1-a3",
						time: "15:00",
						title:
							selectedActivities[0]?.title || "City Walking Tour",
						description:
							selectedActivities[0]?.description ||
							"Explore the historic city center and get oriented with your surroundings",
						location: "Old Town",
						duration: selectedActivities[0]?.duration || "3 hours",
						type: "activity",
					},
					{
						id: "d1-a4",
						time: "19:00",
						title: "Welcome Dinner",
						description:
							"Enjoy traditional cuisine at a highly-rated local restaurant",
						location: "Downtown",
						duration: "2 hours",
						type: "meal",
					},
				],
			},
			{
				day: 2,
				date: "March 16",
				title: "Cultural Immersion",
				activities: [
					{
						id: "d2-a1",
						time: "08:00",
						title: "Breakfast",
						description: "Breakfast at your accommodation",
						location: selectedAccommodation
							? accommodationOptions.find(
									(a) => a.id === selectedAccommodation,
							  )?.name || "Hotel"
							: "Hotel",
						duration: "1 hour",
						type: "meal",
					},
					{
						id: "d2-a2",
						time: "09:30",
						title:
							selectedActivities[1]?.title || "Local Market Tour",
						description:
							selectedActivities[1]?.description ||
							"Discover local flavors and crafts at the vibrant morning market",
						location: "Central Market",
						duration: selectedActivities[1]?.duration || "3 hours",
						type: "activity",
					},
					{
						id: "d2-a3",
						time: "13:00",
						title: "Lunch Break",
						description:
							"Free time to explore local cafes and rest",
						location: "Market District",
						duration: "1.5 hours",
						type: "free",
					},
					{
						id: "d2-a4",
						time: "15:00",
						title: selectedActivities[2]?.title || "Museum Visit",
						description:
							selectedActivities[2]?.description ||
							"Explore the city's rich history, art, and cultural heritage",
						location: "Museum Quarter",
						duration:
							selectedActivities[2]?.duration || "2-3 hours",
						type: "activity",
					},
					{
						id: "d2-a5",
						time: "19:00",
						title: "Dinner",
						description:
							"Dining experience at a recommended local restaurant",
						location: "Waterfront",
						duration: "2 hours",
						type: "meal",
					},
				],
			},
			{
				day: 3,
				date: "March 17",
				title: "Adventure Day",
				activities: [
					{
						id: "d3-a1",
						time: "08:00",
						title: "Early Breakfast",
						description: "Fuel up for an adventurous day",
						location: "Hotel",
						duration: "1 hour",
						type: "meal",
					},
					{
						id: "d3-a2",
						time: "09:00",
						title:
							selectedActivities[3]?.title || "Coastal Day Trip",
						description:
							selectedActivities[3]?.description ||
							"Full day excursion to breathtaking coastal attractions and hidden gems",
						location: "Coastal Area",
						duration: "Full day",
						type: "activity",
					},
					{
						id: "d3-a3",
						time: "19:00",
						title: "Return & Dinner",
						description:
							"Return to the city and enjoy a casual dinner",
						location: "City Center",
						duration: "2 hours",
						type: "meal",
					},
				],
			},
			{
				day: 4,
				date: "March 18",
				title: "Culinary & Cultural Experiences",
				activities: [
					{
						id: "d4-a1",
						time: "09:00",
						title: "Leisure Morning",
						description:
							"Sleep in and enjoy a relaxed late breakfast",
						location: "Hotel",
						duration: "2 hours",
						type: "free",
					},
					{
						id: "d4-a2",
						time: "11:00",
						title: selectedActivities[4]?.title || "Cooking Class",
						description:
							selectedActivities[4]?.description ||
							"Learn to prepare authentic traditional dishes with expert guidance",
						location: "Culinary School",
						duration: selectedActivities[4]?.duration || "3 hours",
						type: "activity",
					},
					{
						id: "d4-a3",
						time: "15:00",
						title: "Free Time",
						description:
							"Explore at your own pace, shop for souvenirs, or simply relax",
						location: "Various",
						duration: "3 hours",
						type: "free",
					},
					{
						id: "d4-a4",
						time: "19:00",
						title:
							selectedActivities.find(
								(a) => a.tag === "Relaxation",
							)?.title || "Sunset Experience",
						description:
							"Evening activity with stunning views and memorable moments",
						location: "Scenic Viewpoint",
						duration: "2 hours",
						type: "activity",
					},
				],
			},
			{
				day: 5,
				date: "March 19",
				title: "Nature & Wellness",
				activities: [
					{
						id: "d5-a1",
						time: "08:00",
						title: "Healthy Breakfast",
						description:
							"Nutritious breakfast to start your wellness day",
						location: "Hotel",
						duration: "1 hour",
						type: "meal",
					},
					{
						id: "d5-a2",
						time: "09:30",
						title:
							selectedActivities[5]?.title ||
							"Nature Walk & Hiking",
						description:
							selectedActivities[5]?.description ||
							"Trek through scenic trails with breathtaking panoramic views",
						location: "Nature Reserve",
						duration: selectedActivities[5]?.duration || "4 hours",
						type: "activity",
					},
					{
						id: "d5-a3",
						time: "14:00",
						title: "Spa & Wellness Session",
						description:
							"Afternoon of relaxation with rejuvenating treatments and thermal baths",
						location: selectedAccommodation
							? accommodationOptions.find(
									(a) => a.id === selectedAccommodation,
							  )?.name || "Spa"
							: "Local Spa",
						duration: "3 hours",
						type: "activity",
					},
					{
						id: "d5-a4",
						time: "19:00",
						title: "Farewell Dinner",
						description:
							"Special celebratory dinner at a top-rated fine dining restaurant",
						location: "Fine Dining District",
						duration: "2 hours",
						type: "meal",
					},
				],
			},
			{
				day: 6,
				date: "March 20",
				title: "Last Moments & Memories",
				activities: [
					{
						id: "d6-a1",
						time: "08:00",
						title: "Final Breakfast",
						description: "Leisurely breakfast and begin packing",
						location: "Hotel",
						duration: "2 hours",
						type: "meal",
					},
					{
						id: "d6-a2",
						time: "10:00",
						title: "Souvenir Shopping",
						description:
							"Pick up last-minute souvenirs and local specialties to bring home",
						location: "Shopping District",
						duration: "2 hours",
						type: "free",
					},
					{
						id: "d6-a3",
						time: "13:00",
						title: "Farewell Lunch",
						description:
							"Final meal at a favorite spot before departure",
						location: "City Center",
						duration: "1.5 hours",
						type: "meal",
					},
					{
						id: "d6-a4",
						time: "15:00",
						title: "Free Time",
						description: "Final stroll through your favorite areas",
						location: "Various",
						duration: "2 hours",
						type: "free",
					},
				],
			},
			{
				day: 7,
				date: "March 21",
				title: "Departure",
				activities: [
					{
						id: "d7-a1",
						time: "08:00",
						title: "Check-out",
						description: "Check out from your accommodation",
						location: "Hotel",
						duration: "1 hour",
						type: "transport",
					},
					{
						id: "d7-a2",
						time: "10:00",
						title: "Airport Transfer",
						description: "Comfortable transfer to the airport",
						location: "Airport",
						duration: "1 hour",
						type: "transport",
					},
					{
						id: "d7-a3",
						time: "12:00",
						title: selectedTransport
							? transportOptions.find(
									(t) => t.id === selectedTransport,
							  )?.carrier + " Departure"
							: "Departure Flight",
						description:
							"Return journey home with wonderful memories",
						location: trip.destination + " Airport",
						duration: "Travel time",
						type: "transport",
					},
				],
			},
		];

		setGeneratedItinerary(sampleItinerary);
		// Expand all days by default
		setExpandedDays(sampleItinerary.map((d) => d.day));
		setIsGeneratingItinerary(false);
		setViewMode("itinerary");

		// Save the trip data with generated itinerary
		const savedData: SavedTripData = {
			trip,
			transport:
				transportOptions.find((t) => t.id === selectedTransport) ||
				null,
			accommodation:
				accommodationOptions.find(
					(a) => a.id === selectedAccommodation,
				) || null,
			itinerary: itineraryItems.filter((i) =>
				selectedItinerary.includes(i.id),
			),
			generatedItinerary: sampleItinerary,
			savedAt: new Date().toISOString(),
		};
		onSaveTrip?.(savedData);
	};

	const backToSelection = () => {
		setViewMode("selection");
		setOpenSection("transport");
	};

	const toggleDay = (day: number) => {
		setExpandedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const toggleItineraryItem = (id: string) => {
		setSelectedItinerary((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const getCategoryLabel = (category: AccommodationOption["category"]) => {
		switch (category) {
			case "budget":
				return "Budget";
			case "comfort":
				return "Comfort";
			case "premium":
				return "Premium";
		}
	};

	const getCategoryColor = (category: AccommodationOption["category"]) => {
		switch (category) {
			case "budget":
				return "bg-green-100 text-green-800";
			case "comfort":
				return "bg-blue-100 text-blue-800";
			case "premium":
				return "bg-amber-100 text-amber-800";
		}
	};

	const getTravelStyleEmoji = (style: string) => {
		const lowerStyle = style.toLowerCase();
		if (lowerStyle.includes("adventure")) return "🏔️";
		if (lowerStyle.includes("relax")) return "🏖️";
		if (lowerStyle.includes("cultural") || lowerStyle.includes("culture"))
			return "🏛️";
		if (lowerStyle.includes("food")) return "🍽️";
		if (lowerStyle.includes("nature")) return "🌲";
		if (lowerStyle.includes("urban")) return "🏙️";
		return "✈️";
	};

	const getActivityTypeIcon = (type: string) => {
		switch (type) {
			case "meal":
				return "🍽️";
			case "transport":
				return "✈️";
			case "activity":
				return "🎯";
			case "free":
				return "⭐";
			default:
				return "📍";
		}
	};

	const getActivityTypeColor = (type: string) => {
		switch (type) {
			case "meal":
				return "bg-orange-50 text-orange-700 border-orange-200";
			case "transport":
				return "bg-blue-50 text-blue-700 border-blue-200";
			case "activity":
				return "bg-green-50 text-green-700 border-green-200";
			case "free":
				return "bg-purple-50 text-purple-700 border-purple-200";
			default:
				return "bg-gray-50 text-gray-700 border-gray-200";
		}
	};

	const basePrice = parseInt(trip.budgetRange.replace(/[^0-9]/g, ""));

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
	};

	const prevImage = () => {
		setCurrentImageIndex(
			(prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
		);
	};

	const toggleSection = (section: AccordionSection) => {
		setOpenSection(openSection === section ? null : section);
	};

	const handleTransportSelect = (id: string) => {
		setSelectedTransport(selectedTransport === id ? null : id);
		setTimeout(() => {
			if (openSection === "transport" && selectedTransport !== id) {
				setOpenSection("accommodation");
			}
		}, 400);
	};

	const handleAccommodationSelect = (id: string) => {
		setSelectedAccommodation(selectedAccommodation === id ? null : id);
		setTimeout(() => {
			if (
				openSection === "accommodation" &&
				selectedAccommodation !== id
			) {
				setOpenSection("activities");
			}
		}, 400);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Back button */}
			<div className="absolute top-6 left-6 z-50">
				<button
					onClick={
						viewMode === "itinerary" ? backToSelection : onBack
					}
					className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
				>
					<ChevronLeft className="w-5 h-5" />
					<span>
						{viewMode === "itinerary" ? "Edit Selections" : "Back"}
					</span>
				</button>
			</div>

			{/* Two column layout */}
			<div className="flex h-screen overflow-hidden">
				{/* Left column - Fixed image carousel */}
				<div className="w-[45%] relative bg-card flex-shrink-0">
					<div className="relative h-full">
						<Image
							src={
								galleryImages[currentImageIndex] ||
								"/placeholder.svg"
							}
							alt={`${trip.destination} ${currentImageIndex + 1}`}
							fill
							className="object-cover"
							priority
						/>

						<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

						<button
							onClick={prevImage}
							className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
						>
							<ChevronLeft className="w-5 h-5" />
						</button>
						<button
							onClick={nextImage}
							className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
						>
							<ChevronRight className="w-5 h-5" />
						</button>

						<div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
							{currentImageIndex + 1} / {galleryImages.length}
						</div>

						<div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
							{galleryImages.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentImageIndex(index)}
									className={`w-2 h-2 rounded-full transition-all ${
										index === currentImageIndex
											? "bg-background w-6"
											: "bg-background/50 hover:bg-background/70"
									}`}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Right column - Scrollable content */}
				<div className="flex-1 overflow-y-auto">
					<div className="max-w-3xl mx-auto px-8 py-12 pb-32">
						{/* Trip Overview - Always Visible */}
						<div className="mb-6 space-y-4">
							<div className="inline-block">
								<span className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-sm font-medium border border-border">
									{getTravelStyleEmoji(trip.travelStyle)}{" "}
									{trip.travelStyle}
								</span>
							</div>

							<h1 className="text-3xl font-bold text-foreground">
								{trip.title}
							</h1>

							<div className="grid grid-cols-2 gap-3.5">
								<div className="flex items-center gap-2 text-muted-foreground">
									<MapPin className="w-4 h-4" />
									<span className="text-sm">
										{trip.destination}
									</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<Calendar className="w-4 h-4" />
									<span className="text-sm">
										{trip.dates}
									</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<DollarSign className="w-4 h-4" />
									<span className="text-sm">
										From ${basePrice}
									</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground">
									<Clock className="w-4 h-4" />
									<span className="text-sm">7 nights</span>
								</div>
							</div>

							<p className="text-muted-foreground leading-relaxed">
								{trip.description}
							</p>
						</div>

						{viewMode === "selection" ? (
							<>
								{/* SELECTION MODE - Trip Planning Accordions */}

								{/* Transportation Section */}
								<div className="mb-4 bg-card border border-border overflow-hidden transition-all duration-300 shadow-sm rounded-md">
									<button
										onClick={() =>
											toggleSection("transport")
										}
										className="w-full px-6 py-5 flex items-center justify-between hover:bg-secondary/50 transition-all duration-200"
									>
										<div className="flex items-center gap-3 flex-1">
											<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
												<Plane className="w-5 h-5 text-primary" />
											</div>
											<div className="text-left flex-1">
												<h2 className="text-lg font-bold text-foreground">
													Transportation
												</h2>
												{selectedTransport ? (
													<p className="text-sm text-muted-foreground">
														{
															transportOptions.find(
																(t) =>
																	t.id ===
																	selectedTransport,
															)?.carrier
														}
													</p>
												) : (
													<p className="text-sm text-muted-foreground">
														Choose your travel
														option
													</p>
												)}
											</div>
											{selectedTransport && (
												<div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
													<Check className="w-4 h-4 text-primary-foreground" />
												</div>
											)}
										</div>
										<ChevronDown
											className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ml-2 ${
												openSection === "transport"
													? "rotate-180"
													: ""
											}`}
										/>
									</button>

									<div
										className={`overflow-hidden transition-all duration-300 ease-in-out ${
											openSection === "transport"
												? "max-h-[1000px] opacity-100"
												: "max-h-0 opacity-0"
										}`}
									>
										<div className="px-6 pb-6 space-y-3">
											{transportOptions.map((option) => {
												const isSelected =
													selectedTransport ===
													option.id;
												const Icon =
													option.type === "flight"
														? Plane
														: Train;

												return (
													<button
														key={option.id}
														onClick={() =>
															handleTransportSelect(
																option.id,
															)
														}
														className={`w-full text-left p-4 rounded-md border-2 transition-all duration-200 ${
															isSelected
																? "border-primary bg-primary/5"
																: "border-border hover:border-muted-foreground bg-background"
														}`}
													>
														<div className="flex items-start gap-3">
															<div
																className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
																	isSelected
																		? "bg-primary text-primary-foreground"
																		: "bg-secondary text-foreground"
																}`}
															>
																<Icon className="w-5 h-5" />
															</div>
															<div className="flex-1 min-w-0">
																<div className="flex items-start justify-between gap-2">
																	<div className="flex-1">
																		<p className="font-semibold text-foreground">
																			{
																				option.carrier
																			}
																		</p>
																		<p className="text-sm text-muted-foreground mt-0.5">
																			{
																				option.from
																			}{" "}
																			→{" "}
																			{
																				option.to
																			}
																		</p>
																	</div>
																	<div className="text-right">
																		<p className="text-xl font-bold text-foreground">
																			$
																			{
																				option.price
																			}
																		</p>
																	</div>
																</div>
																<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
																	<span>
																		{
																			option.departureDate
																		}
																	</span>
																	<span>
																		•
																	</span>
																	<span>
																		{
																			option.departureTime
																		}{" "}
																		-{" "}
																		{
																			option.arrivalTime
																		}
																	</span>
																	<span>
																		•
																	</span>
																	<span>
																		{
																			option.duration
																		}
																	</span>
																</div>
															</div>
														</div>
													</button>
												);
											})}

											<button
												onClick={() =>
													setSelectedTransport(null)
												}
												className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
											>
												Skip - I'll arrange my own
												transportation
											</button>
										</div>
									</div>
								</div>

								{/* Accommodation Section */}
								<div className="mb-4 bg-card border border-border overflow-hidden transition-all duration-300 rounded-md shadow-sm">
									<button
										onClick={() =>
											toggleSection("accommodation")
										}
										className="w-full px-6 py-5 flex items-center justify-between hover:bg-secondary/50 transition-all duration-200"
									>
										<div className="flex items-center gap-3 flex-1">
											<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
												<Bed className="w-5 h-5 text-primary" />
											</div>
											<div className="text-left flex-1">
												<h2 className="text-lg font-bold text-foreground">
													Accommodation
												</h2>
												{selectedAccommodation ? (
													<p className="text-sm text-muted-foreground">
														{
															accommodationOptions.find(
																(a) =>
																	a.id ===
																	selectedAccommodation,
															)?.name
														}
													</p>
												) : (
													<p className="text-sm text-muted-foreground">
														Where you'll stay
													</p>
												)}
											</div>
											{selectedAccommodation && (
												<div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
													<Check className="w-4 h-4 text-primary-foreground" />
												</div>
											)}
										</div>
										<ChevronDown
											className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ml-2 ${
												openSection === "accommodation"
													? "rotate-180"
													: ""
											}`}
										/>
									</button>

									<div
										className={`overflow-hidden transition-all duration-300 ease-in-out ${
											openSection === "accommodation"
												? "max-h-[2000px] opacity-100"
												: "max-h-0 opacity-0"
										}`}
									>
										<div className="px-6 pb-6 space-y-3">
											{accommodationOptions.map(
												(option) => {
													const isSelected =
														selectedAccommodation ===
														option.id;

													return (
														<button
															key={option.id}
															onClick={() =>
																handleAccommodationSelect(
																	option.id,
																)
															}
															className={`w-full text-left border-2 overflow-hidden transition-all duration-200 rounded-md ${
																isSelected
																	? "border-primary bg-primary/5"
																	: "border-border hover:border-muted-foreground bg-background"
															}`}
														>
															<div className="flex flex-col sm:flex-row">
																<div className="relative w-full sm:w-40 h-40 sm:h-auto flex-shrink-0">
																	<Image
																		src={
																			option.image ||
																			"/placeholder.svg"
																		}
																		alt={
																			option.name
																		}
																		fill
																		className="object-cover"
																	/>
																</div>

																<div className="flex-1 p-4">
																	<div className="flex items-start justify-between gap-2 mb-2">
																		<span
																			className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md ${getCategoryColor(
																				option.category,
																			)}`}
																		>
																			{getCategoryLabel(
																				option.category,
																			)}
																		</span>
																		<div className="text-right">
																			<p className="text-xl font-bold text-foreground">
																				$
																				{
																					option.totalPrice
																				}
																			</p>
																			<p className="text-xs text-muted-foreground">
																				total
																			</p>
																		</div>
																	</div>

																	<h3 className="font-bold text-foreground mb-1">
																		{
																			option.name
																		}
																	</h3>
																	<p className="text-sm text-muted-foreground mb-2">
																		{
																			option.location
																		}
																	</p>

																	<div className="flex items-center gap-1.5 mb-2">
																		<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
																		<span className="text-sm font-semibold text-foreground">
																			{
																				option.rating
																			}
																		</span>
																		<span className="text-sm text-muted-foreground">
																			(
																			{
																				option.reviewCount
																			}
																			)
																		</span>
																	</div>

																	<p className="text-sm text-muted-foreground mb-2">
																		$
																		{
																			option.pricePerNight
																		}{" "}
																		per
																		night
																	</p>

																	<div className="flex flex-wrap gap-1.5">
																		{option.amenities.map(
																			(
																				amenity,
																			) => (
																				<span
																					key={
																						amenity
																					}
																					className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded border border-border"
																				>
																					{
																						amenity
																					}
																				</span>
																			),
																		)}
																	</div>
																</div>
															</div>
														</button>
													);
												},
											)}
										</div>
									</div>
								</div>

								{/* Activities Section */}
								<div className="mb-4 bg-card border border-border overflow-hidden transition-all duration-300 rounded-md shadow-sm">
									<button
										onClick={() =>
											toggleSection("activities")
										}
										className="w-full px-6 py-5 flex items-center justify-between hover:bg-secondary/50 transition-all duration-200"
									>
										<div className="flex items-center gap-3 flex-1">
											<div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
												<Star className="w-5 h-5 text-primary" />
											</div>
											<div className="text-left flex-1">
												<h2 className="text-lg font-bold text-foreground">
													Activities & Add-ons
												</h2>
												<p className="text-sm text-muted-foreground">
													{selectedItinerary.length >
													0
														? `${
																selectedItinerary.length
														  } ${
																selectedItinerary.length ===
																1
																	? "activity"
																	: "activities"
														  } selected`
														: "Optional experiences"}
												</p>
											</div>
											{selectedItinerary.length > 0 && (
												<div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
													<Check className="w-4 h-4 text-primary-foreground" />
												</div>
											)}
										</div>
										<ChevronDown
											className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ml-2 ${
												openSection === "activities"
													? "rotate-180"
													: ""
											}`}
										/>
									</button>

									<div
										className={`overflow-hidden transition-all duration-300 ease-in-out ${
											openSection === "activities"
												? "max-h-[3000px] opacity-100"
												: "max-h-0 opacity-0"
										}`}
									>
										<div className="px-6 pb-6 space-y-2">
											{itineraryItems.map((item) => {
												const isSelected =
													selectedItinerary.includes(
														item.id,
													);

												return (
													<button
														key={item.id}
														onClick={() =>
															toggleItineraryItem(
																item.id,
															)
														}
														className={`w-full text-left p-3 rounded-md border-2 transition-all duration-200 ${
															isSelected
																? "border-primary bg-primary/5"
																: "border-border hover:border-muted-foreground bg-background"
														}`}
													>
														<div className="flex items-start gap-3">
															<div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
																<Image
																	src={
																		item.image ||
																		"/placeholder.svg"
																	}
																	alt={
																		item.title
																	}
																	fill
																	className="object-cover"
																/>
															</div>

															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2 mb-1.5">
																	<span className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded border border-border font-medium">
																		{
																			item.tag
																		}
																	</span>
																	<div className="flex items-center gap-1 text-xs text-muted-foreground">
																		<Clock className="w-3 h-3" />
																		<span>
																			{
																				item.duration
																			}
																		</span>
																	</div>
																</div>
																<h4 className="font-semibold text-foreground text-sm mb-1">
																	{item.title}
																</h4>
																<p className="text-xs text-muted-foreground line-clamp-2">
																	{
																		item.description
																	}
																</p>
															</div>

															{isSelected && (
																<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
																	<Check className="w-3 h-3 text-primary-foreground" />
																</div>
															)}
														</div>
													</button>
												);
											})}

											{selectedItinerary.length > 0 && (
												<button
													onClick={() =>
														setSelectedItinerary([])
													}
													className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
												>
													Clear all activities
												</button>
											)}
										</div>
									</div>
								</div>

								{/* Summary Section */}
								<div className="bg-card border border-border overflow-hidden p-6 rounded-md shadow-sm">
									<h2 className="text-lg font-bold text-foreground mb-4">
										Trip Summary
									</h2>

									<div className="space-y-3">
										{selectedTransport && (
											<div className="flex items-center justify-between py-2">
												<div className="flex items-center gap-2">
													<Plane className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm text-foreground">
														Transportation
													</span>
												</div>
												<span className="text-sm font-semibold text-foreground">
													$
													{
														transportOptions.find(
															(t) =>
																t.id ===
																selectedTransport,
														)?.price
													}
												</span>
											</div>
										)}

										{selectedAccommodation && (
											<div className="flex items-center justify-between py-2">
												<div className="flex items-center gap-2">
													<Bed className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm text-foreground">
														Accommodation
													</span>
												</div>
												<span className="text-sm font-semibold text-foreground">
													$
													{
														accommodationOptions.find(
															(a) =>
																a.id ===
																selectedAccommodation,
														)?.totalPrice
													}
												</span>
											</div>
										)}

										{selectedItinerary.length > 0 && (
											<div className="flex items-center justify-between py-2">
												<div className="flex items-center gap-2">
													<Star className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm text-foreground">
														{
															selectedItinerary.length
														}{" "}
														{selectedItinerary.length ===
														1
															? "Activity"
															: "Activities"}
													</span>
												</div>
											</div>
										)}

										{(selectedTransport ||
											selectedAccommodation) && (
											<>
												<div className="border-t border-border my-3"></div>
												<div className="flex items-center justify-between py-2">
													<span className="text-base font-bold text-foreground">
														Estimated Total
													</span>
													<span className="text-2xl font-bold text-foreground">
														$
														{estimatedPrice.toLocaleString()}
													</span>
												</div>
											</>
										)}

										{!selectedTransport &&
											!selectedAccommodation && (
												<p className="text-sm text-muted-foreground text-center py-4">
													Select transportation or
													accommodation to see your
													trip summary
												</p>
											)}
									</div>
								</div>
							</>
						) : (
							<>
								{/* ITINERARY VIEW - Generated Day-by-Day Plan */}
								<div className="mb-6 p-5 bg-primary/5 border border-primary/20 rounded-md">
									<div className="flex items-start gap-3">
										<Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
										<div>
											<h3 className="font-bold text-foreground mb-1">
												Your Personalized Itinerary
											</h3>
											<p className="text-sm text-muted-foreground">
												We've created a detailed
												day-by-day plan based on your
												selections. Click on any day to
												expand and see the full
												schedule.
											</p>
										</div>
									</div>
								</div>

								{generatedItinerary?.map((day) => (
									<div
										key={day.day}
										className="mb-4 bg-card border border-border rounded-md shadow-sm overflow-hidden"
									>
										<button
											onClick={() => toggleDay(day.day)}
											className="w-full px-6 py-5 flex items-center justify-between hover:bg-secondary/30 transition-all duration-200"
										>
											<div className="flex items-center gap-4 flex-1">
												<div className="w-12 h-12 rounded-md bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
													<span className="text-lg font-bold">
														{day.day}
													</span>
												</div>
												<div className="text-left flex-1">
													<h3 className="text-lg font-bold text-foreground">
														{day.title}
													</h3>
													<p className="text-sm text-muted-foreground">
														{day.date} •{" "}
														{day.activities.length}{" "}
														activities
													</p>
												</div>
											</div>
											<ChevronDown
												className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ml-2 ${
													expandedDays.includes(
														day.day,
													)
														? "rotate-180"
														: ""
												}`}
											/>
										</button>

										<div
											className={`overflow-hidden transition-all duration-300 ease-in-out ${
												expandedDays.includes(day.day)
													? "max-h-[3000px] opacity-100"
													: "max-h-0 opacity-0"
											}`}
										>
											<div className="px-6 pb-6 space-y-3">
												{day.activities.map(
													(activity, index) => (
														<div
															key={activity.id}
															className="flex gap-4"
														>
															{/* Timeline */}
															<div className="flex flex-col items-center">
																<div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
																	<span className="text-xs font-semibold text-foreground">
																		{
																			activity.time
																		}
																	</span>
																</div>
																{index <
																	day
																		.activities
																		.length -
																		1 && (
																	<div className="w-0.5 flex-1 bg-border my-1"></div>
																)}
															</div>

															{/* Activity Card */}
															<div className="flex-1 pb-4">
																<div className="p-4 bg-background border border-border rounded-md">
																	<div className="flex items-start justify-between gap-3 mb-2">
																		<div className="flex-1">
																			<div className="flex items-center gap-2 mb-2">
																				<span
																					className={`text-xs px-2 py-1 rounded border font-medium ${getActivityTypeColor(
																						activity.type,
																					)}`}
																				>
																					{getActivityTypeIcon(
																						activity.type,
																					)}{" "}
																					{
																						activity.type
																					}
																				</span>
																				<span className="text-xs text-muted-foreground flex items-center gap-1">
																					<Clock className="w-3 h-3" />
																					{
																						activity.duration
																					}
																				</span>
																			</div>
																			<h4 className="font-bold text-foreground mb-1">
																				{
																					activity.title
																				}
																			</h4>
																			<p className="text-sm text-muted-foreground mb-2">
																				{
																					activity.description
																				}
																			</p>
																			<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
																				<MapPin className="w-3 h-3" />
																				<span>
																					{
																						activity.location
																					}
																				</span>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													),
												)}
											</div>
										</div>
									</div>
								))}

								{/* Edit Options */}
								<div className="mt-6 p-5 bg-secondary/30 border border-border rounded-md">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Edit2 className="w-4 h-4 text-muted-foreground" />
											<span className="text-sm font-medium text-foreground">
												Want to make changes?
											</span>
										</div>
										<button
											onClick={backToSelection}
											className="px-4 py-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
										>
											Edit Selections
										</button>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Sticky CTA */}
			<div className="fixed bottom-0 right-0 left-[45%] bg-background border-t border-border shadow-lg z-40">
				<div className="max-w-3xl mx-auto px-8 py-4">
					{viewMode === "selection" ? (
						<button
							onClick={generateItinerary}
							disabled={!canGenerate || isGeneratingItinerary}
							className={`w-full px-8 py-3.5 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
								canGenerate && !isGeneratingItinerary
									? "bg-primary text-primary-foreground hover:opacity-90 shadow-md"
									: "bg-muted text-muted-foreground cursor-not-allowed"
							}`}
						>
							{isGeneratingItinerary ? (
								<>
									<Sparkles className="w-4 h-4 animate-pulse" />
									Generating your itinerary...
								</>
							) : (
								<>
									<Sparkles className="w-4 h-4" />
									Generate My Itinerary
								</>
							)}
						</button>
					) : (
						<div className="flex gap-3">
							<button
								onClick={backToSelection}
								className="flex-1 px-6 py-3.5 rounded-md font-semibold border-2 border-border text-foreground hover:bg-secondary transition-all duration-200"
							>
								<Edit2 className="w-4 h-4 inline mr-2" />
								Edit Trip
							</button>
							<button
								onClick={onReviewTrip}
								className="flex-1 px-6 py-3.5 rounded-md font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all duration-200"
							>
								Save & Continue
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Loading Overlay during generation */}
			{isGeneratingItinerary && (
				<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-card border border-border shadow-xl rounded-lg px-8 py-6 max-w-md mx-4">
						<div className="flex items-center gap-4 mb-4">
							<Sparkles className="w-8 h-8 text-primary animate-pulse" />
							<div>
								<h3 className="text-lg font-bold text-foreground">
									Creating Your Itinerary
								</h3>
								<p className="text-sm text-muted-foreground">
									Planning the perfect trip for you...
								</p>
							</div>
						</div>
						<div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
							<div
								className="h-full bg-primary animate-pulse"
								style={{ width: "70%" }}
							></div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
