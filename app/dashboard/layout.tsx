"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, Compass, User } from "lucide-react";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const pathname = usePathname();
	const router = useRouter();

	const tabs = [
		{
			id: "explore",
			label: "Explore",
			icon: Compass,
			path: "/dashboard/explore",
		},
		{
			id: "itineraries",
			label: "My Itineraries",
			icon: Briefcase,
			path: "/dashboard/itineraries",
		},
	];

	const activeTab = pathname.includes("/itineraries") ? "itineraries" : "explore";

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header with Logo and Tabs */}
			<header className="sticky top-0 z-30 bg-card border-b border-border">
				<div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 py-1">
					<div className="flex items-center justify-between h-14">
						{/* Logo */}
						<Link
							href="/dashboard/explore"
							className="flex items-center gap-2 text-lg font-semibold text-foreground"
						>
							<Image
								src="/android/android-launchericon-48-48.png"
								alt=""
								width={24}
								height={24}
								className="size-6 object-contain"
							/>
							Easy Travels
						</Link>

						{/* Navigation Tabs */}
						<nav className="flex items-center gap-2">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								const isActive = activeTab === tab.id;

								return (
									<button
										key={tab.id}
										onClick={() => router.push(tab.path)}
										className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors
											${
												isActive
													? "text-primary bg-primary/10"
													: "text-muted-foreground hover:text-foreground hover:bg-secondary"
											}`}
									>
										<Icon className="w-4 h-4" />
										<span className="hidden sm:inline">{tab.label}</span>
									</button>
								);
							})}
						</nav>

						{/* User Profile */}
						<div className="flex items-center justify-center">
							<div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-muted-foreground">
								<User className="w-4 h-4" />
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1">{children}</main>
		</div>
	);
}
