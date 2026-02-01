"use client";

import Image from "next/image";

interface MockSuggestion {
	type: "destination" | "activity";
	name: string;
	location?: string;
	country?: string;
	category?: string;
	image: string;
	description: string;
}

const MOCK_SUGGESTIONS: MockSuggestion[] = [
	{
		type: "destination",
		name: "Barcelona",
		country: "Spain",
		image: "/android/android-launchericon-192-192.png",
		description: "Vibrant culture and stunning architecture",
	},
	{
		type: "destination",
		name: "Tokyo",
		country: "Japan",
		image: "/android/android-launchericon-144-144.png",
		description: "Modern city meets ancient tradition",
	},
	{
		type: "destination",
		name: "Bali",
		country: "Indonesia",
		image: "/android/android-launchericon-96-96.png",
		description: "Tropical paradise with rich culture",
	},
	{
		type: "destination",
		name: "Paris",
		country: "France",
		image: "/android/android-launchericon-72-72.png",
		description: "City of lights and romance",
	},
	{
		type: "destination",
		name: "New York",
		country: "USA",
		image: "/android/android-launchericon-48-48.png",
		description: "The city that never sleeps",
	},
	{
		type: "destination",
		name: "Iceland",
		country: "Iceland",
		image: "/ios/180.png",
		description: "Land of fire and ice",
	},
	{
		type: "destination",
		name: "Dubai",
		country: "UAE",
		image: "/ios/152.png",
		description: "Modern luxury in the desert",
	},
	{
		type: "destination",
		name: "Santorini",
		country: "Greece",
		image: "/ios/120.png",
		description: "Whitewashed buildings and blue domes",
	},
];

export function MockSuggestionsLoader() {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2">
				<div className="h-1 flex-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full overflow-hidden">
					<div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full animate-pulse" />
				</div>
			</div>

			<div>
				<h3 className="text-sm font-medium text-muted-foreground mb-4">
					While you wait, check out what other travelers liked
				</h3>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{MOCK_SUGGESTIONS.map((suggestion, index) => (
						<div
							key={index}
							className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-md cursor-not-allowed opacity-75"
						>
							{/* Shimmer overlay */}
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
								style={{
									backgroundSize: "200% 100%",
									animation: "shimmer 2s infinite",
								}}
							/>

							{/* Image */}
							<div className="relative aspect-[4/3] overflow-hidden bg-muted">
								<Image
									src={suggestion.image}
									alt={suggestion.name}
									fill
									className="object-cover transition-transform duration-300 group-hover:scale-105"
									unoptimized
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
								
								{/* Type badge */}
								<div className="absolute top-2 right-2">
									<span className="px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-foreground backdrop-blur-sm">
										{suggestion.type === "destination" ? "Destination" : "Activity"}
									</span>
								</div>
							</div>

							{/* Content */}
							<div className="p-4">
								<h3 className="font-semibold text-foreground mb-1">
									{suggestion.name}
								</h3>
								{suggestion.country && (
									<p className="text-sm text-muted-foreground mb-2">
										{suggestion.country}
									</p>
								)}
								{suggestion.category && (
									<p className="text-sm text-muted-foreground mb-2">
										{suggestion.category}
									</p>
								)}
								<p className="text-xs text-muted-foreground line-clamp-2">
									{suggestion.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<style jsx>{`
				@keyframes shimmer {
					0% {
						background-position: -200% 0;
					}
					100% {
						background-position: 200% 0;
					}
				}
			`}</style>
		</div>
	);
}
