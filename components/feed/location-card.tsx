"use client";

import Image from "next/image";
import { MapPin, Loader2 } from "lucide-react";
import type { Location } from "@/generated/prisma/client";

interface LocationCardProps {
	location: Location;
	onClick: () => void;
	isSelected?: boolean;
	isResearching?: boolean;
}

export function LocationCard({
	location,
	onClick,
	isSelected = false,
	isResearching = false,
}: LocationCardProps) {
	const imageUrl = location.imageUrl || "/placeholder.svg";

	return (
		<button
			onClick={onClick}
			className="w-full h-full text-left bg-card overflow-hidden border border-border hover:border-muted-foreground shadow-sm hover:shadow-md transition-all duration-200 group rounded-md flex flex-col cursor-pointer"
		>
			{/* Hero Image */}
			<div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
				<Image
					src={imageUrl}
					alt={location.name}
					fill
					className="object-cover group-hover:scale-105 transition-transform duration-300"
				/>
				{!isResearching && (
					<div className="absolute inset-x-0 bottom-0 px-3 pb-3">
						<div className="inline-flex items-center gap-2 rounded-full bg-black/80 text-white text-sm font-semibold px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all group-hover:scale-[1.03]">
							Research this destination
						</div>
					</div>
				)}
				{isSelected && (
					<div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1.5 rounded">
						Selected
					</div>
				)}
				{isResearching && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
						<div className="flex items-center gap-2 text-white">
							<Loader2 className="w-5 h-5 animate-spin" />
							<span className="text-sm font-medium">Researching with Manus ...</span>
						</div>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4 space-y-3">
				<h3 className="font-bold text-foreground text-lg leading-snug line-clamp-2">
					{location.name}
				</h3>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<MapPin className="w-3.5 h-3.5" />
					<span>
						{location.city ? `${location.city}, ` : ""}
						{location.country}
					</span>
				</div>

				{location.description && (
					<p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
						{location.description}
					</p>
				)}

				{location.reason && (
					<p className="text-xs text-primary font-medium line-clamp-2">
						{location.reason}
					</p>
				)}
			</div>
		</button>
	);
}
