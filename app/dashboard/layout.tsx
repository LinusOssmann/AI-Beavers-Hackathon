"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const router = useRouter();
	const [userName, setUserName] = useState<string>("");

	useEffect(() => {
		// Get user session
		const getSession = async () => {
			const session = await authClient.getSession();
			if (session?.data?.user?.name) {
				setUserName(session.data.user.name);
			}
		};
		getSession();
	}, []);

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

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold">TripMatch</h1>
						{userName && (
							<p className="text-sm text-muted-foreground">
								Welcome back, {userName}
							</p>
						)}
					</div>
					<Button variant="ghost" size="sm" onClick={handleSignOut}>
						<LogOut className="w-4 h-4 mr-2" />
						Sign Out
					</Button>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1">
				{children}
			</main>
		</div>
	);
}
