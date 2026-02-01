import InstallPrompt from "@/components/pwa/install-prompt";
import { PushNotificationButtons } from "@/components/pwa/push-notification-buttons";
import { Button } from "@/components/ui/button";
import { Compass, Map, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Image
							src="/android/android-launchericon-48-48.png"
							alt=""
							width={24}
							height={24}
							className="size-6 object-contain"
						/>
						<h1 className="text-xl font-semibold">TripMatch</h1>
					</div>
					<Button variant="ghost" asChild>
						<Link href="/sign-in">Sign In</Link>
					</Button>
				</div>
			</header>

			{/* Hero Section */}
			<main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
				<div className="max-w-3xl mx-auto text-center space-y-6">
					<div className="space-y-4">
						<h2 className="text-4xl md:text-6xl font-bold tracking-tight">
							Let's plan a trip that actually fits you
						</h2>
						<div className="flex justify-center gap-8">
							<InstallPrompt />
							<PushNotificationButtons />
						</div>


						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
							Answer a few quick questions and we'll suggest trips
							based on your style, budget, and mood.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						<Button size="lg" className="text-lg" asChild>
							<Link href="/sign-up">Get Started</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="text-lg"
							asChild
						>
							<Link href="/sign-in">Sign In</Link>
						</Button>
					</div>
					<div className="flex flex-col items-center gap-2 pt-6">
						<span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
							Powered by
						</span>
						<img
							src="https://upload.wikimedia.org/wikipedia/en/f/f7/Manus_logo.svg"
							alt="Manus"
							className="h-6 w-auto"
							style={{ height: "50px" }}
							loading="lazy"
						/>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
					<div className="text-center space-y-2">
						<div className="flex justify-center">
							<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
								<Sparkles className="w-6 h-6 text-primary" />
							</div>
						</div>
						<h3 className="font-semibold">
							AI-Powered Suggestions
						</h3>
						<p className="text-sm text-muted-foreground">
							Get personalized trip recommendations based on your
							preferences and travel style
						</p>
					</div>

					<div className="text-center space-y-2">
						<div className="flex justify-center">
							<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
								<Map className="w-6 h-6 text-primary" />
							</div>
						</div>
						<h3 className="font-semibold">Smart Planning</h3>
						<p className="text-sm text-muted-foreground">
							Organize your trips with locations, accommodations,
							activities, and transportation
						</p>
					</div>


					<div className="text-center space-y-2">
						<div className="flex justify-center">
							<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
								<Compass className="w-6 h-6 text-primary" />
							</div>
						</div>
						<h3 className="font-semibold">Discover New Places</h3>
						<p className="text-sm text-muted-foreground">
							Explore destinations you never knew existed,
							perfectly matched to your interests
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
