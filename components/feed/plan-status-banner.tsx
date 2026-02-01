"use client";

import { Calendar, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PlanStatusBannerProps {
	plan: {
		id: string;
		title: string;
		createdAt: Date;
		generationStatus: string;
		lastGeneratedAt?: Date | null;
	};
}

export function PlanStatusBanner({ plan }: PlanStatusBannerProps) {
	const router = useRouter();
	const isGenerating = plan.generationStatus === "generating_locations" || 
		plan.generationStatus === "generating_research";
	
	const handleCreateNew = () => {
		// Refresh the page which will show the create plan dialog in SuggestionsFeed
		router.refresh();
	};
	
	const getStatusInfo = () => {
		switch (plan.generationStatus) {
			case "generating_locations":
				return {
					label: "Generating Locations",
					color: "text-blue-600 bg-blue-50 border-blue-200",
					icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
				};
			case "generating_research":
				return {
					label: "Researching",
					color: "text-purple-600 bg-purple-50 border-purple-200",
					icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
				};
			case "completed":
				return {
					label: "Ready",
					color: "text-green-600 bg-green-50 border-green-200",
					icon: <Sparkles className="w-3.5 h-3.5" />,
				};
			default:
				return {
					label: "Idle",
					color: "text-muted-foreground bg-secondary border-border",
					icon: <Calendar className="w-3.5 h-3.5" />,
				};
		}
	};

	const statusInfo = getStatusInfo();

	return (
		<div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-border">
			<div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 py-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="flex flex-col">
							<div className="flex items-center gap-2">
								<h3 className="text-sm font-semibold text-foreground">
									{plan.title}
								</h3>
								<span
									className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
								>
									{statusInfo.icon}
									{statusInfo.label}
								</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Created {new Date(plan.createdAt).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
								{plan.lastGeneratedAt && (
									<>
										{" · "}
										Last updated {new Date(plan.lastGeneratedAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											hour: "numeric",
											minute: "2-digit",
										})}
									</>
								)}
							</p>
						</div>
					</div>

					<Button
						onClick={handleCreateNew}
						disabled={isGenerating}
						variant="outline"
						size="sm"
						className="flex items-center gap-2"
					>
						<Sparkles className="w-4 h-4" />
						Create New Plan
					</Button>
				</div>

				{isGenerating && (
					<div className="mt-3">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
								<div className="h-full bg-primary/60 rounded-full animate-pulse w-2/3" />
							</div>
							<span>AI is working...</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
