"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogOut, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

interface User {
	id: string;
	name: string;
	email: string;
	preferences?: {
		travelStyles?: string[];
		budget?: string;
		tripLength?: string;
		companion?: string;
		departureLocation?: string;
	};
	plans: Array<{
		id: string;
		title: string;
		description?: string;
		startDate?: Date;
		endDate?: Date;
		createdAt: Date;
		updatedAt: Date;
	}>;
}

interface DashboardProps {
	user: User;
}

export function Dashboard({ user }: DashboardProps) {
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			toast.success("Signed out successfully");
			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Sign out error:", error);
			toast.error("Failed to sign out");
		}
	};

	const handleCreatePlan = () => {
		// TODO: Navigate to plan creation flow
		toast.info("Plan creation coming soon!");
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Main Content */}
			<main className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* User Preferences */}
					{user.preferences && (
						<Card>
							<CardHeader>
								<CardTitle>Your Travel Preferences</CardTitle>
								<CardDescription>
									We use these to personalize your trip
									suggestions
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{user.preferences.travelStyles &&
										user.preferences.travelStyles.length >
											0 && (
											<div>
												<p className="text-sm font-medium text-muted-foreground">
													Travel Styles
												</p>
												<div className="flex flex-wrap gap-2 mt-1">
													{user.preferences.travelStyles.map(
														(style) => (
															<span
																key={style}
																className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
															>
																{style}
															</span>
														),
													)}
												</div>
											</div>
										)}
									{user.preferences.budget && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Budget
											</p>
											<p className="text-sm mt-1 capitalize">
												{user.preferences.budget}
											</p>
										</div>
									)}
									{user.preferences.tripLength && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Trip Length
											</p>
											<p className="text-sm mt-1 capitalize">
												{user.preferences.tripLength}
											</p>
										</div>
									)}
									{user.preferences.companion && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Travel With
											</p>
											<p className="text-sm mt-1 capitalize">
												{user.preferences.companion}
											</p>
										</div>
									)}
									{user.preferences.departureLocation && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Departure
											</p>
											<p className="text-sm mt-1 flex items-center gap-1">
												<MapPin className="w-3 h-3" />
												{
													user.preferences
														.departureLocation
												}
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Plans Section */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold">
								Your Trip Plans
							</h2>
							<Button onClick={handleCreatePlan}>
								<Plus className="w-4 h-4 mr-2" />
								Create Plan
							</Button>
						</div>

						{user.plans.length === 0 ? (
							<Card>
								<CardContent className="py-12 text-center">
									<p className="text-muted-foreground mb-4">
										You haven't created any trip plans yet
									</p>
									<Button onClick={handleCreatePlan}>
										<Plus className="w-4 h-4 mr-2" />
										Create Your First Plan
									</Button>
								</CardContent>
							</Card>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{user.plans.map((plan) => (
									<Card
										key={plan.id}
										className="cursor-pointer hover:shadow-md transition-shadow"
									>
										<CardHeader>
											<CardTitle className="text-lg">
												{plan.title}
											</CardTitle>
											{plan.description && (
												<CardDescription>
													{plan.description}
												</CardDescription>
											)}
										</CardHeader>
										<CardContent>
											{plan.startDate && plan.endDate && (
												<p className="text-sm text-muted-foreground">
													{new Date(
														plan.startDate,
													).toLocaleDateString()}{" "}
													-{" "}
													{new Date(
														plan.endDate,
													).toLocaleDateString()}
												</p>
											)}
											<p className="text-xs text-muted-foreground mt-2">
												Updated{" "}
												{new Date(
													plan.updatedAt,
												).toLocaleDateString()}
											</p>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
